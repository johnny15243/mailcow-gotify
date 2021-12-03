import { RedisClient } from "redis";
import { App } from "../app";
import { LogLevel } from "../JobHandler";
import { GotifyMessage } from "../Models/GotifyMessage";
import { FilterConfig, IACMELog, IAPILog, IAutodiscoverLog, IDovecotLog, INetfilterLog, IPostfixLog, IRLLog, ISogoLog, IWatchdogLog, MailcowServices, MailcowServiceCfg } from "../Models/MailcowLogModels";
import { GotifyPushMessageJob } from "./GotifyPushMessageJob";
import { Job } from "./Job";
import { RedisConnectJob } from "./RedisConnectJob";
const { promisify } = require('util');


export class MailcowCollectLogsJob extends Job{
    protected interval: number = 500;
    protected fetchDataLimit:number = 100;

    protected forwardedLogs:{[key:string]:IACMELog[]|IAPILog[]|IAutodiscoverLog[]|IDovecotLog[]|INetfilterLog[]|IPostfixLog[]|IRLLog[]|ISogoLog[]|IWatchdogLog[]} = {"DOVECOT":[],"SOGO":[],"WATCHDOG":[],"POSTFIX":[],"ACME":[],"API":[],"AUTODISCOVER":[],"NETFILTER":[],"RL":[]};
    protected mailcowServices:MailcowServiceCfg[] = [];

    private states: {[key:string]:string[]} = {"ERROR":["EMERG", "ALERT", "CRIT", "ERR"]
                                                ,"WARN":["WARNING", "WARN"]
                                                ,"INFO":["NOTICE", "INFO", "DEBUG"]};

    constructor(services:MailcowServiceCfg[]){

        super();
        this.mailcowServices = services;

    }

    private render(tmpl:string,data:Object):string{
        let retText = tmpl;
        Object.entries(data).forEach((key)=>{
            let ptrn = new RegExp(`{{\\s*toDate\\s*\\((\\s*`+key[0]+`\\s*)\\)}}`, 'mg');
            //console.log({"ptrn":ptrn,"test":ptrn.test(tmpl),'match':tmpl.match(/{{\s*toDate\s*\((\s*_time\s*)\)}}/mg),"testString":tmpl});
            if(ptrn.test(tmpl)){
                retText = retText.replace(ptrn, (new Date(key[1]*1000).toLocaleString('de-DE')));
            }
            retText = retText.replace("{{"+key[0]+"}}", key[1]);
        });
        return retText;
    }

    public async execute(){
        try{
            await this.mailcowServices.forEach(async (cfg:MailcowServiceCfg)=>{
                if(cfg.enabled){
                    this.handleLogs(cfg);
                }
            })
           //await this.handleDovecotLogs()
            this.addLog(LogLevel.HEARTBEAT)
        }catch(err:any){
            this.addLog(LogLevel.ERROR, err.toString());
        }
    }


    private async handleLogs(cfg:MailcowServiceCfg){
        let logs:any[] = await this.collectData(cfg);
        let logsToSubmit = logs.filter(this.filterLogs.bind(this, cfg.filterCfg));
        let messages:GotifyMessage[] =  this.dataToGotifyMessage(logsToSubmit, cfg);
        
        //prevent memory overflow and resending messages
        this.handleforwardedLogs(cfg.filterCfg.service, logsToSubmit);
        
        this.addLog(LogLevel.INFO, "MESSAGES " + cfg.service +" created "+messages.length );
        messages.forEach((msg)=>{
            GotifyPushMessageJob.pushMessage(msg);
        })
    }

    private async collectData(cfg:MailcowServiceCfg):Promise<any[]>{

        let logList:any[] = [];
        let getAsync = promisify(this.redisClient.LRANGE).bind(this.redisClient);
        let response: string[] = await getAsync(cfg.redisKey, 0, this.fetchDataLimit-1);

        response.forEach((data:string)=>{

            let tmpObj:any = this.getInstanceByServicename(cfg.service);
            Object.assign(tmpObj, JSON.parse(data));
            logList.push(tmpObj);

        });

        return logList;

    }


    private dataToGotifyMessage(data: any[], cfg:MailcowServiceCfg):GotifyMessage[]{
        
        let gotifyMessages: GotifyMessage[] = [];
        let i:number = 0, len:number = data.length;

        while( i<len ){

            let gotMsg = new GotifyMessage();
            gotMsg.title = this.render(cfg.gotify.title,data[i]);
            gotMsg.message = this.render(cfg.gotify.message,data[i]);
            gotMsg.token = cfg.gotify.token;
            gotMsg.priority = 5;
            gotifyMessages.push(gotMsg);
            i++;

        }

        return gotifyMessages;

    }


    //General hellper functions

    private getInstanceByServicename(serviceName:MailcowServices):any{
        switch(serviceName){
            case MailcowServices["ACME"]:
                return new IACMELog();
            case MailcowServices["AUTODISCOVER"]: 
                return new IAutodiscoverLog();
            case MailcowServices["DOVECOT"]:
                return new IDovecotLog();
            case MailcowServices["NETFILTER"]:
                return new INetfilterLog();
            case MailcowServices["POSTFIX"]:
                return new IPostfixLog();
            case MailcowServices["SOGO"]:
                return new ISogoLog();
            case MailcowServices["WATCHDOG"]:
                return new IWatchdogLog();
        }
    }
    

    private filterLogs(service:FilterConfig, data:any):boolean{

        //Check LOGState
        let match:boolean = true;
        if(service.searchVal instanceof RegExp){
            match = service.searchVal.test(data[service.field])
        }else if(Array.isArray(service.searchVal)){ // OLD Concept marked as expired
            match = service.searchVal.findIndex((msg)=>{ return msg === data[service.field].toUpperCase() }) > -1;
        }

        if(!match){
            return false;
        }

        let forwardedBefore: boolean = this.forwardedLogs[service.service].findIndex((obj:any)=>{
            let retVal:boolean = true;
            Object.keys(data).forEach((key)=>{
                retVal = data[key] == obj[key] && retVal;
            })
            return retVal;
        })>-1;

        return match && !forwardedBefore;

    }

    
    private handleforwardedLogs(key:string,data:IACMELog[]|IAPILog[]|IAutodiscoverLog[]|IDovecotLog[]|INetfilterLog[]|IPostfixLog[]|IRLLog[]|ISogoLog[]|IWatchdogLog[]){
        this.forwardedLogs[key] = <IACMELog[]|IAPILog[]|IAutodiscoverLog[]|IDovecotLog[]|INetfilterLog[]|IPostfixLog[]|IRLLog[]|ISogoLog[]|IWatchdogLog[]>[...data,...this.forwardedLogs[key]];
        this.forwardedLogs[key].splice(this.fetchDataLimit,this.forwardedLogs[key].length-this.fetchDataLimit);

    }

    
    private get redisClient():RedisClient{
        return RedisConnectJob.redisConnection;
    }
    
}