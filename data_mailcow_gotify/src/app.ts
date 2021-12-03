'use strict'

require('dotenv').config();

import { ClientOpts } from "redis";
import { JobHandler, LogLevel } from "./JobHandler";
import { MailcowCollectLogsJob } from "./Jobs/MailcowCollectLogsJob";
import { GotifyPushMessageJob } from "./Jobs/GotifyPushMessageJob";
import { RedisConnectJob } from "./Jobs/RedisConnectJob";
import { MailcowServices, MailcowServiceCfg } from "./Models/MailcowLogModels";


export class App{

    private static _instance:App;

    private _jobHandler:JobHandler = new JobHandler();

    private gotifyJobs:MailcowServiceCfg[] = [{service:MailcowServices["DOVECOT"]
                                                        , enabled: !!+(process.env["GFY_DOVECOT_ENABLED"] || "1")
                                                        ,gotify:{
                                                            token: process.env["GFY_DOVECOT_GOTIFY_TOKEN"] || process.env["GFY_GOTIFY_TOKEN"] || ""
                                                            , title: process.env["GFY_DOVECOT_GOTIFY_TITLE"] || "DOVECOT {{priority}}"
                                                            , message: process.env["GFY_DOVECOT_GOTIFY_MESSAGE"] || `{{toDate(_time)}}# {{program}} | {{message}}`
                                                            , priority: 5
                                                        }
                                                        , redisKey: process.env["GFY_DOVECOT_REDIS_REDIS_KEY"] || "DOVECOT_MAILLOG"
                                                        , filterCfg:{
                                                            service:"DOVECOT"
                                                            , searchVal: new RegExp(process.env["GFY_DOVECOT_REDIS_SEARCH_REGEXP"] || "(EMERG|ALERT|CRIT|ERR)", "gmi") //ERROR = ["EMERG", "ALERT", "CRIT", "ERR"] | WARN = ["WARNING", "WARN"] | NOTICE | ["NOTICE", "INFO", "DEBUG"]
                                                            , field: process.env["GFY_DOVECOT_REDIS_SEARCH_FIELD"] || "priority"}}

                                                    ,{service:MailcowServices["SOGO"]
                                                        , enabled: !!+(process.env["GFY_SOGO_ENABLED"] || "1")
                                                        , gotify:{
                                                            token: process.env["GFY_SOGO_GOTIFY_TOKEN"] || process.env["GFY_GOTIFY_TOKEN"] || ""
                                                            , title: process.env["GFY_SOGO_GOTIFY_TITLE"] || "SOGO {{priority}}"
                                                            , message: process.env["GFY_SOGO.GOTIFY_MESSAGE"] || `{{toDate(_time)}}# {{program}} | {{message}}`
                                                            , priority: 5
                                                        }
                                                        , redisKey: process.env["GFY_SOGO_REDIS_REDIS_KEY"] || "SOGO_LOG"
                                                        , filterCfg:{
                                                            service:"SOGO"
                                                            , searchVal: new RegExp(process.env["GFY_SOGO_REDIS_SEARCH_REGEXP"] || "(EMERG|ALERT|CRIT|ERR)", "gmi") 
                                                            ,field: process.env["GFY_SOGO_REDIS_SEARCH_FIELD"] || "priority"}}

                                                    ,{service:MailcowServices["WATCHDOG"]
                                                        , enabled: !!+(process.env["GFY_WATCHDOG_ENABLED"] || "1")
                                                        , gotify:{
                                                            token: process.env["GFY_WATCHDOG_GOTIFY_TOKEN"] || process.env["GFY_GOTIFY_TOKEN"] || ""
                                                            , title: process.env["GFY_WATCHDOG_GOTIFY_TITLE"] || "Watchdog Service {{service}} Health:{{_lvl}}%"
                                                            , message: process.env["GFY_WATCHDOG_GOTIFY_MESSAGE"] || `Der Service {{service}} hat zum Zeitpunkt {{toDate(_time)}} eine Gesundheit von {{_lvl}}% !`
                                                            , priority: 5
                                                        }
                                                        , redisKey: process.env["GFY_WATCHDOG_REDIS_REDIS_KEY"] || "WATCHDOG_LOG"
                                                        , filterCfg:{service:"WATCHDOG"
                                                            , field: process.env["GFY_WATCHDOG_REDIS_SEARCH_FIELD"] || "lvl"
                                                            , searchVal:new RegExp( process.env["GFY_WATCHDOG_REDIS_SEARCH_REGEXP"] || "\\b(0*(?:[1-9][0-9]?|0))\\b", "gmi")}}

                                                    ,{service:MailcowServices["POSTFIX"]
                                                        , enabled: !!+(process.env["GFY_POSTFIX_ENABLED"] || "1")
                                                        , gotify:{
                                                            token: process.env["GFY_POSTFIX_GOTIFY_TOKEN"] || process.env["GFY_GOTIFY_TOKEN"] || ""
                                                            , title: process.env["GFY_POSTFIX_GOTIFY_TITLE"] || "Postfix {{priority}}"
                                                            , message: process.env["GFY_POSTFIX_GOTIFY_MESSAGE"] || "{{toDate(_time)}}# {{program}} => {{message}}"
                                                            , priority: 5
                                                        }
                                                        , redisKey: process.env["GFY_POSTFIX_REDIS_REDIS_KEY"] || "POSTFIX_MAILLOG"
                                                        , filterCfg:{
                                                            service:"POSTFIX"
                                                            , searchVal: new RegExp( process.env["GFY_POSTFIX_REDIS_SEARCH_REGEXP"] || "(EMERG|ALERT|CRIT|ERR)", "gmi")
                                                            ,field: process.env["GFY_POSTFIX_REDIS_SEARCH_FIELD"] || "priority"}}

                                                    ,{service:MailcowServices["ACME"]
                                                        , enabled: !!+(process.env["GFY_ACME_ENABLED"] || "1")
                                                        , gotify:{
                                                            token: process.env["GFY_ACME_GOTIFY_TOKEN"] || process.env["GFY_GOTIFY_TOKEN"] || ""
                                                            , title: process.env["GFY_ACME_GOTIFY_TITLE"] || "ACME"
                                                            , message: process.env["GFY_ACME_GOTIFY_MESSAGE"] || "{{toDate(_time)}}# {{message}}"
                                                            , priority: 5
                                                        }
                                                        , redisKey: process.env["GFY_ACME_REDIS_REDIS_KEY"] || "ACME_LOG"
                                                        , filterCfg:{
                                                            service:"ACME"
                                                            , field: process.env["GFY_ACME_REDIS_SEARCH_FIELD"] || "message"
                                                            , searchVal:new RegExp(process.env["GFY_ACME_REDIS_SEARCH_REGEXP"] || "(error|failed)","gmi")}}

                                                    /*,{service:MailcowServices["API"]
                                                        , gotify:{
                                                            token: "AtBVEcJZ4iJtf8T"
                                                            , title: "API"
                                                            , message: "{{toDate(_time)}}# {{message}}"
                                                            , priority: 5
                                                        }
                                                        , redisKey: "ACME_LOG"
                                                        , filterCfg:{
                                                            service:"ACME"
                                                            , field:"message"
                                                            , searchVal:/(error|failed)/gmi}}*/

                                                    ,{service:MailcowServices["AUTODISCOVER"]
                                                        , enabled: !!+(process.env["GFY_AUTODISCOVER_ENABLED"] || "1")
                                                        , gotify:{
                                                            token: process.env["GFY_AUTODISCOVER_GOTIFY_TOKEN"] || process.env["GFY_GOTIFY_TOKEN"] || ""
                                                            , title: process.env["GFY_AUTODISCOVER_GOTIFY_TITLE"] || "AUTODISCOVER"
                                                            , message: process.env["GFY_AUTODISCOVER_GOTIFY_MESSAGE"] || "{{toDate(_time)}}# USER<{{user}}> \n AGENT<{{ua}}>\n Message: {{service}}"
                                                            , priority: 5
                                                        }
                                                        , redisKey: process.env["GFY_AUTODISCOVER_REDIS_REDIS_KEY"] || "AUTODISCOVER_LOG"
                                                        , filterCfg:{
                                                            service:"AUTODISCOVER"
                                                            , field: process.env["GFY_AUTODISCOVER_REDIS_SEARCH_FIELD"] || "service"
                                                            , searchVal: new RegExp(process.env["GFY_AUTODISCOVER_REDIS_SEARCH_REGEXP"] || "(error)","gmi")}}

                                                    ,{service:MailcowServices["NETFILTER"]
                                                        , enabled: !!+(process.env["GFY_NETFILTER_ENABLED"] || "1")
                                                        , gotify:{
                                                            token: process.env["GFY_NETFILTER_GOTIFY_TOKEN"] || process.env["GFY_GOTIFY_TOKEN"] || ""
                                                            , title: process.env["GFY_NETFILTER_GOTIFY_TITLE"] || "Netfilter {{priority}}"
                                                            , message: process.env["GFY_NETFILTER_GOTIFY_MESSAGE"] || "{{toDate(_time)}}#  {{message}}"
                                                            , priority: 5
                                                        }
                                                        , redisKey: process.env["GFY_NETFILTER_REDIS_REDIS_KEY"] || "NETFILTER_LOG"
                                                        , filterCfg:{
                                                            service:"NETFILTER"
                                                            , searchVal: new RegExp( process.env["GFY_NETFILTER_REDIS_SEARCH_REGEXP"] || "(EMERG|ALERT|CRIT|ERR)", "gmi" )
                                                            ,field: process.env["GFY_NETFILTER_REDIS_SEARCH_FIELD"] || "priority"}}

                                                    ,{service:MailcowServices["RL"]
                                                        , enabled: !!+(process.env["GFY_RATELIMIT_ENABLED"] || "1")
                                                        , gotify:{
                                                            token: process.env["GFY_RATELIMIT_GOTIFY_TOKEN"] || process.env["GFY_GOTIFY_TOKEN"] || ""
                                                            , title: process.env["GFY_RATELIMIT_GOTIFY_TITLE"] || "Ratelimit {{priority}}"
                                                            , message: process.env["GFY_RATELIMIT_GOTIFY_MESSAGE"] || "{{toDate(_time)}}#  {{message}}"
                                                            , priority: 5
                                                        }
                                                        , redisKey: process.env["GFY_RATELIMIT_REDIS_REDIS_KEY"] || "RL_LOG"
                                                        , filterCfg:{
                                                            service:"RL"
                                                            , searchVal: new RegExp( process.env["GFY_RATELIMIT_REDIS_SEARCH_REGEXP"] || "(.*)", "gmi")
                                                            ,field: process.env["GFY_RATELIMIT_REDIS_SEARCH_FIELD"] || "rl_hash"}}];


    private constructor(){
        //console.log(this.gotifyJobs);
        this.createJobs()
        if((process.env["GFY_LOG_MODE"] || "PROD")=="DEBUG"){
            this._jobHandler.monitorJobs([LogLevel.ERROR, LogLevel.INFO, LogLevel.WARN, LogLevel.HEARTBEAT]);
        }else{
            this._jobHandler.monitorJobs([LogLevel.ERROR]);
        }
    }

    public static getInstance(): App{
        if(App._instance){
            return App._instance;
        }else{
            App._instance = new App();
            return App._instance;
        }
    }

    private createJobs(){
        this._jobHandler.add( new GotifyPushMessageJob(process.env["GFY.GOTIFY.ADDRESS"]||"", process.env["GFY.GOTYFY.HEALTH"]||""));
        this._jobHandler.add( 
            RedisConnectJob.getInstance(<ClientOpts>{
                        port: parseInt(process.env.REDIS_SLAVEOF_PORT || '6379') || 6379,
                        host: process.env.REDIS_SLAVEOF_IP || '127.0.0.1'
                    })
                );

        this._jobHandler.add(new MailcowCollectLogsJob( this.gotifyJobs ))
    }

}



App.getInstance();