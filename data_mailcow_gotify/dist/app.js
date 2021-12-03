'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
require('dotenv').config();
const JobHandler_1 = require("./JobHandler");
const MailcowCollectLogsJob_1 = require("./Jobs/MailcowCollectLogsJob");
const GotifyPushMessageJob_1 = require("./Jobs/GotifyPushMessageJob");
const RedisConnectJob_1 = require("./Jobs/RedisConnectJob");
const MailcowLogModels_1 = require("./Models/MailcowLogModels");
class App {
    constructor() {
        this._jobHandler = new JobHandler_1.JobHandler();
        this.gotifyJobs = [{ service: MailcowLogModels_1.MailcowServices["DOVECOT"],
                enabled: !!+(process.env["GFY.DOVECOT.ENABLED"] || "1"),
                gotify: {
                    token: process.env["GFY.DOVECOT.GOTIFY.TOKEN"] || process.env["GFY.GOTIFY.TOKEN"] || "",
                    title: process.env["GFY.DOVECOT.GOTIFY.TITLE"] || "DOVECOT {{priority}}",
                    message: process.env["GFY.DOVECOT.GOTIFY.MESSAGE"] || `{{toDate(_time)}}# {{program}} | {{message}}`,
                    priority: 5
                },
                redisKey: process.env["GFY.DOVECOT.REDIS.REDIS_KEY"] || "DOVECOT_MAILLOG",
                filterCfg: {
                    service: "DOVECOT",
                    searchVal: new RegExp(process.env["GFY.DOVECOT.REDIS.SEARCH_REGEXP"] || "(EMERG|ALERT|CRIT|ERR)", "gmi") //ERROR = ["EMERG", "ALERT", "CRIT", "ERR"] | WARN = ["WARNING", "WARN"] | NOTICE | ["NOTICE", "INFO", "DEBUG"]
                    ,
                    field: process.env["GFY.DOVECOT.REDIS.SEARCH_FIELD"] || "priority"
                } },
            { service: MailcowLogModels_1.MailcowServices["SOGO"],
                enabled: !!+(process.env["GFY.SOGO.ENABLED"] || "1"),
                gotify: {
                    token: process.env["GFY.SOGO.GOTIFY.TOKEN"] || process.env["GFY.GOTIFY.TOKEN"] || "",
                    title: process.env["GFY.SOGO.GOTIFY.TITLE"] || "SOGO {{priority}}",
                    message: process.env["GFY.SOGO.GOTIFY.MESSAGE"] || `{{toDate(_time)}}# {{program}} | {{message}}`,
                    priority: 5
                },
                redisKey: process.env["GFY.SOGO.REDIS.REDIS_KEY"] || "SOGO_LOG",
                filterCfg: {
                    service: "SOGO",
                    searchVal: new RegExp(process.env["GFY.SOGO.REDIS.SEARCH_REGEXP"] || "(EMERG|ALERT|CRIT|ERR)", "gmi"),
                    field: process.env["GFY.SOGO.REDIS.SEARCH_FIELD"] || "priority"
                } },
            { service: MailcowLogModels_1.MailcowServices["WATCHDOG"],
                enabled: !!+(process.env["GFY.WATCHDOG.ENABLED"] || "1"),
                gotify: {
                    token: process.env["GFY.WATCHDOG.GOTIFY.TOKEN"] || process.env["GFY.GOTIFY.TOKEN"] || "",
                    title: process.env["GFY.WATCHDOG.GOTIFY.TITLE"] || "Watchdog Service {{service}} Health:{{_lvl}}%",
                    message: process.env["GFY.WATCHDOG.GOTIFY.MESSAGE"] || `Der Service {{service}} hat zum Zeitpunkt {{toDate(_time)}} eine Gesundheit von {{_lvl}}% !`,
                    priority: 5
                },
                redisKey: process.env["GFY.WATCHDOG.REDIS.REDIS_KEY"] || "WATCHDOG_LOG",
                filterCfg: { service: "WATCHDOG",
                    field: process.env["GFY.WATCHDOG.REDIS.SEARCH_FIELD"] || "lvl",
                    searchVal: new RegExp(process.env["GFY.WATCHDOG.REDIS.SEARCH_REGEXP"] || "\\b(0*(?:[1-9][0-9]?|0))\\b", "gmi") } },
            { service: MailcowLogModels_1.MailcowServices["POSTFIX"],
                enabled: !!+(process.env["GFY.POSTFIX.ENABLED"] || "1"),
                gotify: {
                    token: process.env["GFY.POSTFIX.GOTIFY.TOKEN"] || process.env["GFY.GOTIFY.TOKEN"] || "",
                    title: process.env["GFY.POSTFIX.GOTIFY.TITLE"] || "Postfix {{priority}}",
                    message: process.env["GFY.POSTFIX.GOTIFY.MESSAGE"] || "{{toDate(_time)}}# {{program}} => {{message}}",
                    priority: 5
                },
                redisKey: process.env["GFY.POSTFIX.REDIS.REDIS_KEY"] || "POSTFIX_MAILLOG",
                filterCfg: {
                    service: "POSTFIX",
                    searchVal: new RegExp(process.env["GFY.POSTFIX.REDIS.SEARCH_REGEXP"] || "(EMERG|ALERT|CRIT|ERR)", "gmi"),
                    field: process.env["GFY.POSTFIX.REDIS.SEARCH_FIELD"] || "priority"
                } },
            { service: MailcowLogModels_1.MailcowServices["ACME"],
                enabled: !!+(process.env["GFY.ACME.ENABLED"] || "1"),
                gotify: {
                    token: process.env["GFY.ACME.GOTIFY.TOKEN"] || process.env["GFY.GOTIFY.TOKEN"] || "",
                    title: process.env["GFY.ACME.GOTIFY.TITLE"] || "ACME",
                    message: process.env["GFY.ACME.GOTIFY.MESSAGE"] || "{{toDate(_time)}}# {{message}}",
                    priority: 5
                },
                redisKey: process.env["GFY.ACME.REDIS.REDIS_KEY"] || "ACME_LOG",
                filterCfg: {
                    service: "ACME",
                    field: process.env["GFY.ACME.REDIS.SEARCH_FIELD"] || "message",
                    searchVal: new RegExp(process.env["GFY.ACME.REDIS.SEARCH_REGEXP"] || "(error|failed)", "gmi")
                } }
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
            ,
            { service: MailcowLogModels_1.MailcowServices["AUTODISCOVER"],
                enabled: !!+(process.env["GFY.AUTODISCOVER.ENABLED"] || "1"),
                gotify: {
                    token: process.env["GFY.AUTODISCOVER.GOTIFY.TOKEN"] || process.env["GFY.GOTIFY.TOKEN"] || "",
                    title: process.env["GFY.AUTODISCOVER.GOTIFY.TITLE"] || "AUTODISCOVER",
                    message: process.env["GFY.AUTODISCOVER.GOTIFY.MESSAGE"] || "{{toDate(_time)}}# USER<{{user}}> \n AGENT<{{ua}}>\n Message: {{service}}",
                    priority: 5
                },
                redisKey: process.env["GFY.AUTODISCOVER.REDIS.REDIS_KEY"] || "AUTODISCOVER_LOG",
                filterCfg: {
                    service: "AUTODISCOVER",
                    field: process.env["GFY.AUTODISCOVER.REDIS.SEARCH_FIELD"] || "service",
                    searchVal: new RegExp(process.env["GFY.AUTODISCOVER.REDIS.SEARCH_REGEXP"] || "(error)", "gmi")
                } },
            { service: MailcowLogModels_1.MailcowServices["NETFILTER"],
                enabled: !!+(process.env["GFY.NETFILTER.ENABLED"] || "1"),
                gotify: {
                    token: process.env["GFY.NETFILTER.GOTIFY.TOKEN"] || process.env["GFY.GOTIFY.TOKEN"] || "",
                    title: process.env["GFY.NETFILTER.GOTIFY.TITLE"] || "Netfilter {{priority}}",
                    message: process.env["GFY.NETFILTER.GOTIFY.MESSAGE"] || "{{toDate(_time)}}#  {{message}}",
                    priority: 5
                },
                redisKey: process.env["GFY.NETFILTER.REDIS.REDIS_KEY"] || "NETFILTER_LOG",
                filterCfg: {
                    service: "NETFILTER",
                    searchVal: new RegExp(process.env["GFY.NETFILTER.REDIS.SEARCH_REGEXP"] || "(EMERG|ALERT|CRIT|ERR)", "gmi"),
                    field: process.env["GFY.NETFILTER.REDIS.SEARCH_FIELD"] || "priority"
                } },
            { service: MailcowLogModels_1.MailcowServices["RL"],
                enabled: !!+(process.env["GFY.RATELIMIT.ENABLED"] || "1"),
                gotify: {
                    token: process.env["GFY.RATELIMIT.GOTIFY.TOKEN"] || process.env["GFY.GOTIFY.TOKEN"] || "",
                    title: process.env["GFY.RATELIMIT.GOTIFY.TITLE"] || "Ratelimit {{priority}}",
                    message: process.env["GFY.RATELIMIT.GOTIFY.MESSAGE"] || "{{toDate(_time)}}#  {{message}}",
                    priority: 5
                },
                redisKey: process.env["GFY.RATELIMIT.REDIS.REDIS_KEY"] || "RL_LOG",
                filterCfg: {
                    service: "RL",
                    searchVal: new RegExp(process.env["GFY.RATELIMIT.REDIS.SEARCH_REGEXP"] || "(.*)", "gmi"),
                    field: process.env["GFY.RATELIMIT.REDIS.SEARCH_FIELD"] || "rl_hash"
                } }];
        //console.log(this.gotifyJobs);
        this.createJobs();
        if (!!+(process.env["GFI.DEBUG"] || "0")) {
            this._jobHandler.monitorJobs([JobHandler_1.LogLevel.ERROR, JobHandler_1.LogLevel.INFO, JobHandler_1.LogLevel.WARN, JobHandler_1.LogLevel.HEARTBEAT]);
        }
        else {
            this._jobHandler.monitorJobs([JobHandler_1.LogLevel.ERROR]);
        }
    }
    static getInstance() {
        if (App._instance) {
            return App._instance;
        }
        else {
            App._instance = new App();
            return App._instance;
        }
    }
    createJobs() {
        this._jobHandler.add(new GotifyPushMessageJob_1.GotifyPushMessageJob(process.env["GFY.GOTIFY.ADDRESS"] || "", process.env["GFY.GOTYFY.HEALTH"] || ""));
        this._jobHandler.add(RedisConnectJob_1.RedisConnectJob.getInstance({
            port: parseInt(process.env.REDIS_SLAVEOF_PORT || '6379') || 6379,
            host: process.env.REDIS_SLAVEOF_IP || '127.0.0.1'
        }));
        this._jobHandler.add(new MailcowCollectLogsJob_1.MailcowCollectLogsJob(this.gotifyJobs));
    }
}
exports.App = App;
App.getInstance();
