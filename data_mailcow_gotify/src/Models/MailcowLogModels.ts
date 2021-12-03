export enum MailcowServices{
    ACME="ACME"
    , API = "API"
    , AUTODISCOVER = "AUTODISCOVER"
    , DOVECOT = "DOVECOT"
    , NETFILTER = "NETFILTER"
    , POSTFIX = "POSTFIX"
    , SOGO = "SOGO"
    , WATCHDOG = "WATCHDOG"
    , RL = "RL"
}

/*"ERROR":["EMERG", "ALERT", "CRIT", "ERR"]
  "WARN":["WARNING", "WARN"]
  "INFO":["NOTICE", "INFO", "DEBUG"]};
*/

export interface FilterConfig{
    service:"ACME"|"API"|"AUTODISCOVER"|"DOVECOT"|"NETFILTER"|"POSTFIX"|"SOGO"|"WATCHDOG"|"RL"
    , field:string
    , searchVal:string[]|RegExp
}

export interface MailcowGotifyCfg{
    token:string
    , title:string
    , message: string
    , priority: number
}

export interface  MailcowServiceCfg{
    service:MailcowServices
    , enabled: boolean
    , redisKey: string
    , filterCfg:FilterConfig
    , gotify: MailcowGotifyCfg
}

// ACME_LOG
export class IACMELog{

    message: string;
    private _time: number|undefined;

    public get time():number{
        return this._time || 0;
    }
    public set time(val:number|string){
        this._time = +val;
    }
    
}

// API_LOG
export class IAPILog{

    public uri: string;
    public data: string;
    public remote: string;
    public method: string;
    private _time: number|undefined;

    public get time():number{
        return this._time || 0;
    }
    public set time(val:number|string){
        this._time = +val;
    }

}

// AUTODISCOVER_LOG
export class IAutodiscoverLog{
    
    public ua: string;
    public user: string;
    public ip: string;
    public service: string;
    private _time: number|undefined;

    public get time():number{
        return this._time || 0;
    }
    public set time(val:number|string){
        this._time = +val;
    }
}

// DOVECOT_MAILLOG
export class IDovecotLog{

    public message: string;
    public program: string;
    public priority: string;
    private _time: number|undefined;

    public get time():number{
        return this._time || 0;
    }
    public set time(val:number|string){
        this._time = +val;
    }
}

// NETFILTER_LOG
export class INetfilterLog{
    
    public message: string;
    public priority: string;
    private _time: number|undefined;

    public get time():number{
        return this._time || 0;
    }
    public set time(val:number|string){
        this._time = +val;
    }

}

// POSTFIX_MAILLOG
export class IPostfixLog{
    
    public message: string;
    public priority: string;
    public program: string;
    private _time: number|undefined;

    public get time():number{
        return this._time || 0;
    }
    public set time(val:number|string){
        this._time = +val;
    }

}

// RL_LOG
export class IRLLog{
    
    public from: string;
    public header_from: string;
    public header_subject: string;
    public ip: string;
    public message_id: string;
    public qid: string;
    public rcpt: string;
    public rl_hash: string;
    public rl_info: string;
    public rl_name: string;
    private _time: number|undefined;
    public user: string;

    public get time():number{
        return this._time || 0;
    }
    public set time(val:number|string){
        this._time = +val;
    }

}

// SOGO_LOG
export class ISogoLog{

    public message: string;
    public priority: string;
    public program: string;
    private _time: number|undefined;

    public get time():number{
        return this._time || 0;
    }
    public set time(val:number|string){
        this._time = +val;
    }

}

// WATCHDOG_LOG
export class IWatchdogLog{

    private _hpdiff?: number;
    private _hpnow?: number;
    private _hptotal?: number;
    private _lvl?: number;
    public service: string;
    private _time?: number;


    public get hpdiff():number{
        return this._hpdiff || 0;
    }
    public set hpdiff(val:number|string){
        this._hpdiff = +val;
    }

    public get hpnow():number{
        return this._hpnow || 0;
    }
    public set hpnow(val:number|string){
        this._hpnow = +val;
    }

    public get hptotal():number{
        return this._hptotal || 0;
    }
    public set hptotal(val:number|string){
        this._hptotal = +val;
    }

    public get time():number{
        return this._time || 0;
    }
    public set time(val:number|string){
        this._time = +val;
    }

    public get lvl():number{
        return this._lvl || 0;
    }
    public set lvl(val:number|string){
        this._lvl = +val;
    }

}