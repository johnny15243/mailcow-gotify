import axios, { AxiosError, AxiosResponse } from "axios";
import { type } from "os";
import { JobHandler, LogLevel } from "../JobHandler";
import { GotifyMessage } from "../Models/GotifyMessage";
import { Job } from "./Job";

export class GotifyPushMessageJob extends Job{

    protected interval: number = 5000;
    private retryLimit:number = 5;

    private static messages: GotifyMessage[] = [];
    private retryCounter:{id:string,count:number}[] = [];

    private gotifyAddress: string;
    private gotifyHealthAddress?: string;
    private gotifyHealthTimeout: number = 500; // For better reaction in Case of unreachable Gotify-Server


    constructor(httpAddress:string, healthAddress:string|undefined){
        super();
        this.gotifyAddress = httpAddress;
        this.gotifyHealthAddress = healthAddress;
    }


    static pushMessage(message: GotifyMessage){
        GotifyPushMessageJob.messages.push(message);
    }


    private flushMessages():GotifyMessage[]{
        let msgList = GotifyPushMessageJob.messages;
        GotifyPushMessageJob.messages = [];
        return msgList;
    }


    private hasMessages():boolean{
        return GotifyPushMessageJob.messages.length>=1;
    }


    public async execute(){
        if(!await this.targetHealth()){
            this.addLog(LogLevel.ERROR, "Gotify target not ready: " + (this.gotifyHealthAddress||"undefined") )
            return;

        }
        if(this.hasMessages()){

            let msgList:GotifyMessage[] = this.flushMessages()

            for(var i:number=0; i < msgList.length; i++){

                await this.sendMessage(msgList[i]);

            }

            this.addLog(LogLevel.INFO,"FINISHED sending "+msgList.length+" Meassages!")

        }else{

            this.addLog(LogLevel.INFO, "No Data send!")

        }

    }


    public async targetHealth():Promise<boolean>{

        let retVal: boolean = true;
        try{

            if(this.gotifyHealthAddress){

                //AXIOS cache prevention - adding GetValue timestampt to URL
                let nUrl = this.gotifyHealthAddress+"?date="+Date.now();
                let resp:AxiosResponse = await axios.get(nUrl,{timeout:this.gotifyHealthTimeout});
                Object.entries(resp.data).forEach((keyVal)=>{
                     retVal = (keyVal[1] == "green" && retVal)
                });

            }else{

                retVal = false;

            }

        }catch(err){
            retVal = false;

        }
        return retVal;

    }

    private async sendMessage(msg:GotifyMessage){
        try{
            let resp = await axios.post(this.gotifyAddress+"?token="+msg.token
                                            , {
                                                "title":msg.title
                                                ,"message":msg.message
                                                ,"priority":msg.priority
                                            })
        }catch(err){
            if(axios.isAxiosError(err) &&  err.response){
                if( this.checkRetry(msg)){
                    GotifyPushMessageJob.pushMessage(msg)
                }else{
                    this.addLog(LogLevel.ERROR, {"data":msg, "err":err.toJSON}.toString())
                }
            }
        }
    }

    private checkRetry(msg:GotifyMessage):boolean{
        let count:number = this.retryCounter.filter((val)=>val.id).length;
        if(count== -1){
            this.retryCounter.push({id:msg.id,count:1});
        }else if(count == this.retryLimit){
            let index:number = this.retryCounter.findIndex((val)=>val.id == msg.id);
            this.retryCounter.splice(index,1);
            return false;
        }
        return true;
    }

}