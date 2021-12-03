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
                enabled: !!+(process.env["GFY_DOVECOT_ENABLED"] || "1"),
                gotify: {
                    token: process.env["GFY_DOVECOT_GOTIFY_TOKEN"] || process.env["GFY_GOTIFY_TOKEN"] || "",
                    title: process.env["GFY_DOVECOT_GOTIFY_TITLE"] || "DOVECOT {{priority}}",
                    message: process.env["GFY_DOVECOT_GOTIFY_MESSAGE"] || `{{toDate(_time)}}# {{program}} | {{message}}`,
                    priority: 5
                },
                redisKey: process.env["GFY_DOVECOT_REDIS_REDIS_KEY"] || "DOVECOT_MAILLOG",
                filterCfg: {
                    service: "DOVECOT",
                    searchVal: new RegExp(process.env["GFY_DOVECOT_REDIS_SEARCH_REGEXP"] || "(EMERG|ALERT|CRIT|ERR)", "gmi") //ERROR = ["EMERG", "ALERT", "CRIT", "ERR"] | WARN = ["WARNING", "WARN"] | NOTICE | ["NOTICE", "INFO", "DEBUG"]
                    ,
                    field: process.env["GFY_DOVECOT_REDIS_SEARCH_FIELD"] || "priority"
                } },
            { service: MailcowLogModels_1.MailcowServices["SOGO"],
                enabled: !!+(process.env["GFY_SOGO_ENABLED"] || "1"),
                gotify: {
                    token: process.env["GFY_SOGO_GOTIFY_TOKEN"] || process.env["GFY_GOTIFY_TOKEN"] || "",
                    title: process.env["GFY_SOGO_GOTIFY_TITLE"] || "SOGO {{priority}}",
                    message: process.env["GFY_SOGO.GOTIFY_MESSAGE"] || `{{toDate(_time)}}# {{program}} | {{message}}`,
                    priority: 5
                },
                redisKey: process.env["GFY_SOGO_REDIS_REDIS_KEY"] || "SOGO_LOG",
                filterCfg: {
                    service: "SOGO",
                    searchVal: new RegExp(process.env["GFY_SOGO_REDIS_SEARCH_REGEXP"] || "(EMERG|ALERT|CRIT|ERR)", "gmi"),
                    field: process.env["GFY_SOGO_REDIS_SEARCH_FIELD"] || "priority"
                } },
            { service: MailcowLogModels_1.MailcowServices["WATCHDOG"],
                enabled: !!+(process.env["GFY_WATCHDOG_ENABLED"] || "1"),
                gotify: {
                    token: process.env["GFY_WATCHDOG_GOTIFY_TOKEN"] || process.env["GFY_GOTIFY_TOKEN"] || "",
                    title: process.env["GFY_WATCHDOG_GOTIFY_TITLE"] || "Watchdog Service {{service}} Health:{{_lvl}}%",
                    message: process.env["GFY_WATCHDOG_GOTIFY_MESSAGE"] || `Der Service {{service}} hat zum Zeitpunkt {{toDate(_time)}} eine Gesundheit von {{_lvl}}% !`,
                    priority: 5
                },
                redisKey: process.env["GFY_WATCHDOG_REDIS_REDIS_KEY"] || "WATCHDOG_LOG",
                filterCfg: { service: "WATCHDOG",
                    field: process.env["GFY_WATCHDOG_REDIS_SEARCH_FIELD"] || "lvl",
                    searchVal: new RegExp(process.env["GFY_WATCHDOG_REDIS_SEARCH_REGEXP"] || "\\b(0*(?:[1-9][0-9]?|0))\\b", "gmi") } },
            { service: MailcowLogModels_1.MailcowServices["POSTFIX"],
                enabled: !!+(process.env["GFY_POSTFIX_ENABLED"] || "1"),
                gotify: {
                    token: process.env["GFY_POSTFIX_GOTIFY_TOKEN"] || process.env["GFY_GOTIFY_TOKEN"] || "",
                    title: process.env["GFY_POSTFIX_GOTIFY_TITLE"] || "Postfix {{priority}}",
                    message: process.env["GFY_POSTFIX_GOTIFY_MESSAGE"] || "{{toDate(_time)}}# {{program}} => {{message}}",
                    priority: 5
                },
                redisKey: process.env["GFY_POSTFIX_REDIS_REDIS_KEY"] || "POSTFIX_MAILLOG",
                filterCfg: {
                    service: "POSTFIX",
                    searchVal: new RegExp(process.env["GFY_POSTFIX_REDIS_SEARCH_REGEXP"] || "(EMERG|ALERT|CRIT|ERR)", "gmi"),
                    field: process.env["GFY_POSTFIX_REDIS_SEARCH_FIELD"] || "priority"
                } },
            { service: MailcowLogModels_1.MailcowServices["ACME"],
                enabled: !!+(process.env["GFY_ACME_ENABLED"] || "1"),
                gotify: {
                    token: process.env["GFY_ACME_GOTIFY_TOKEN"] || process.env["GFY_GOTIFY_TOKEN"] || "",
                    title: process.env["GFY_ACME_GOTIFY_TITLE"] || "ACME",
                    message: process.env["GFY_ACME_GOTIFY_MESSAGE"] || "{{toDate(_time)}}# {{message}}",
                    priority: 5
                },
                redisKey: process.env["GFY_ACME_REDIS_REDIS_KEY"] || "ACME_LOG",
                filterCfg: {
                    service: "ACME",
                    field: process.env["GFY_ACME_REDIS_SEARCH_FIELD"] || "message",
                    searchVal: new RegExp(process.env["GFY_ACME_REDIS_SEARCH_REGEXP"] || "(error|failed)", "gmi")
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
                enabled: !!+(process.env["GFY_AUTODISCOVER_ENABLED"] || "1"),
                gotify: {
                    token: process.env["GFY_AUTODISCOVER_GOTIFY_TOKEN"] || process.env["GFY_GOTIFY_TOKEN"] || "",
                    title: process.env["GFY_AUTODISCOVER_GOTIFY_TITLE"] || "AUTODISCOVER",
                    message: process.env["GFY_AUTODISCOVER_GOTIFY_MESSAGE"] || "{{toDate(_time)}}# USER<{{user}}> \n AGENT<{{ua}}>\n Message: {{service}}",
                    priority: 5
                },
                redisKey: process.env["GFY_AUTODISCOVER_REDIS_REDIS_KEY"] || "AUTODISCOVER_LOG",
                filterCfg: {
                    service: "AUTODISCOVER",
                    field: process.env["GFY_AUTODISCOVER_REDIS_SEARCH_FIELD"] || "service",
                    searchVal: new RegExp(process.env["GFY_AUTODISCOVER_REDIS_SEARCH_REGEXP"] || "(error)", "gmi")
                } },
            { service: MailcowLogModels_1.MailcowServices["NETFILTER"],
                enabled: !!+(process.env["GFY_NETFILTER_ENABLED"] || "1"),
                gotify: {
                    token: process.env["GFY_NETFILTER_GOTIFY_TOKEN"] || process.env["GFY_GOTIFY_TOKEN"] || "",
                    title: process.env["GFY_NETFILTER_GOTIFY_TITLE"] || "Netfilter {{priority}}",
                    message: process.env["GFY_NETFILTER_GOTIFY_MESSAGE"] || "{{toDate(_time)}}#  {{message}}",
                    priority: 5
                },
                redisKey: process.env["GFY_NETFILTER_REDIS_REDIS_KEY"] || "NETFILTER_LOG",
                filterCfg: {
                    service: "NETFILTER",
                    searchVal: new RegExp(process.env["GFY_NETFILTER_REDIS_SEARCH_REGEXP"] || "(EMERG|ALERT|CRIT|ERR)", "gmi"),
                    field: process.env["GFY_NETFILTER_REDIS_SEARCH_FIELD"] || "priority"
                } },
            { service: MailcowLogModels_1.MailcowServices["RL"],
                enabled: !!+(process.env["GFY_RATELIMIT_ENABLED"] || "1"),
                gotify: {
                    token: process.env["GFY_RATELIMIT_GOTIFY_TOKEN"] || process.env["GFY_GOTIFY_TOKEN"] || "",
                    title: process.env["GFY_RATELIMIT_GOTIFY_TITLE"] || "Ratelimit {{priority}}",
                    message: process.env["GFY_RATELIMIT_GOTIFY_MESSAGE"] || "{{toDate(_time)}}#  {{message}}",
                    priority: 5
                },
                redisKey: process.env["GFY_RATELIMIT_REDIS_REDIS_KEY"] || "RL_LOG",
                filterCfg: {
                    service: "RL",
                    searchVal: new RegExp(process.env["GFY_RATELIMIT_REDIS_SEARCH_REGEXP"] || "(.*)", "gmi"),
                    field: process.env["GFY_RATELIMIT_REDIS_SEARCH_FIELD"] || "rl_hash"
                } }];
        //console.log(this.gotifyJobs);
        this.createJobs();
        if ((process.env["GFY_LOG_MODE"] || "PROD") == "DEBUG") {
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
        this._jobHandler.add(new GotifyPushMessageJob_1.GotifyPushMessageJob(process.env["GFY_GOTIFY_ADDRESS"] || "", process.env["GFY_GOTYFY_HEALTH"] || ""));
        this._jobHandler.add(RedisConnectJob_1.RedisConnectJob.getInstance({
            port: parseInt(process.env.REDIS_SLAVEOF_PORT || '6379') || 6379,
            host: process.env.REDIS_SLAVEOF_IP || '127.0.0.1'
        }));
        this._jobHandler.add(new MailcowCollectLogsJob_1.MailcowCollectLogsJob(this.gotifyJobs));
    }
}
exports.App = App;
App.getInstance();
