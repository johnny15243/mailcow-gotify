"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailcowCollectLogsJob = void 0;
const JobHandler_1 = require("../JobHandler");
const GotifyMessage_1 = require("../Models/GotifyMessage");
const MailcowLogModels_1 = require("../Models/MailcowLogModels");
const GotifyPushMessageJob_1 = require("./GotifyPushMessageJob");
const Job_1 = require("./Job");
const RedisConnectJob_1 = require("./RedisConnectJob");
const { promisify } = require('util');
class MailcowCollectLogsJob extends Job_1.Job {
    constructor(services) {
        super();
        this.interval = 500;
        this.fetchDataLimit = 100;
        this.forwardedLogs = { "DOVECOT": [], "SOGO": [], "WATCHDOG": [], "POSTFIX": [], "ACME": [], "API": [], "AUTODISCOVER": [], "NETFILTER": [], "RL": [] };
        this.mailcowServices = [];
        this.states = { "ERROR": ["EMERG", "ALERT", "CRIT", "ERR"],
            "WARN": ["WARNING", "WARN"],
            "INFO": ["NOTICE", "INFO", "DEBUG"] };
        this.mailcowServices = services;
    }
    render(tmpl, data) {
        let retText = tmpl;
        Object.entries(data).forEach((key) => {
            let ptrn = new RegExp(`{{\\s*toDate\\s*\\((\\s*` + key[0] + `\\s*)\\)}}`, 'mg');
            //console.log({"ptrn":ptrn,"test":ptrn.test(tmpl),'match':tmpl.match(/{{\s*toDate\s*\((\s*_time\s*)\)}}/mg),"testString":tmpl});
            if (ptrn.test(tmpl)) {
                retText = retText.replace(ptrn, (new Date(key[1] * 1000).toLocaleString('de-DE')));
            }
            retText = retText.replace("{{" + key[0] + "}}", key[1]);
        });
        return retText;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.mailcowServices.forEach((cfg) => __awaiter(this, void 0, void 0, function* () {
                    if (cfg.enabled) {
                        this.handleLogs(cfg);
                    }
                }));
                //await this.handleDovecotLogs()
                this.addLog(JobHandler_1.LogLevel.HEARTBEAT);
            }
            catch (err) {
                this.addLog(JobHandler_1.LogLevel.ERROR, err.toString());
            }
        });
    }
    handleLogs(cfg) {
        return __awaiter(this, void 0, void 0, function* () {
            let logs = yield this.collectData(cfg);
            let logsToSubmit = logs.filter(this.filterLogs.bind(this, cfg.filterCfg));
            let messages = this.dataToGotifyMessage(logsToSubmit, cfg);
            //prevent memory overflow and resending messages
            this.handleforwardedLogs(cfg.filterCfg.service, logsToSubmit);
            this.addLog(JobHandler_1.LogLevel.INFO, "MESSAGES " + cfg.service + " created " + messages.length);
            messages.forEach((msg) => {
                GotifyPushMessageJob_1.GotifyPushMessageJob.pushMessage(msg);
            });
        });
    }
    collectData(cfg) {
        return __awaiter(this, void 0, void 0, function* () {
            let logList = [];
            let getAsync = promisify(this.redisClient.LRANGE).bind(this.redisClient);
            let response = yield getAsync(cfg.redisKey, 0, this.fetchDataLimit - 1);
            response.forEach((data) => {
                let tmpObj = this.getInstanceByServicename(cfg.service);
                Object.assign(tmpObj, JSON.parse(data));
                logList.push(tmpObj);
            });
            return logList;
        });
    }
    dataToGotifyMessage(data, cfg) {
        let gotifyMessages = [];
        let i = 0, len = data.length;
        while (i < len) {
            let gotMsg = new GotifyMessage_1.GotifyMessage();
            gotMsg.title = this.render(cfg.gotify.title, data[i]);
            gotMsg.message = this.render(cfg.gotify.message, data[i]);
            gotMsg.token = cfg.gotify.token;
            gotMsg.priority = 5;
            gotifyMessages.push(gotMsg);
            i++;
        }
        return gotifyMessages;
    }
    //General hellper functions
    getInstanceByServicename(serviceName) {
        switch (serviceName) {
            case MailcowLogModels_1.MailcowServices["ACME"]:
                return new MailcowLogModels_1.IACMELog();
            case MailcowLogModels_1.MailcowServices["AUTODISCOVER"]:
                return new MailcowLogModels_1.IAutodiscoverLog();
            case MailcowLogModels_1.MailcowServices["DOVECOT"]:
                return new MailcowLogModels_1.IDovecotLog();
            case MailcowLogModels_1.MailcowServices["NETFILTER"]:
                return new MailcowLogModels_1.INetfilterLog();
            case MailcowLogModels_1.MailcowServices["POSTFIX"]:
                return new MailcowLogModels_1.IPostfixLog();
            case MailcowLogModels_1.MailcowServices["SOGO"]:
                return new MailcowLogModels_1.ISogoLog();
            case MailcowLogModels_1.MailcowServices["WATCHDOG"]:
                return new MailcowLogModels_1.IWatchdogLog();
        }
    }
    filterLogs(service, data) {
        //Check LOGState
        let match = true;
        if (service.searchVal instanceof RegExp) {
            match = service.searchVal.test(data[service.field]);
        }
        else if (Array.isArray(service.searchVal)) { // OLD Concept marked as expired
            match = service.searchVal.findIndex((msg) => { return msg === data[service.field].toUpperCase(); }) > -1;
        }
        if (!match) {
            return false;
        }
        let forwardedBefore = this.forwardedLogs[service.service].findIndex((obj) => {
            let retVal = true;
            Object.keys(data).forEach((key) => {
                retVal = data[key] == obj[key] && retVal;
            });
            return retVal;
        }) > -1;
        return match && !forwardedBefore;
    }
    handleforwardedLogs(key, data) {
        this.forwardedLogs[key] = [...data, ...this.forwardedLogs[key]];
        this.forwardedLogs[key].splice(this.fetchDataLimit, this.forwardedLogs[key].length - this.fetchDataLimit);
    }
    get redisClient() {
        return RedisConnectJob_1.RedisConnectJob.redisConnection;
    }
}
exports.MailcowCollectLogsJob = MailcowCollectLogsJob;
