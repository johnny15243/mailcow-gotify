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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GotifyPushMessageJob = void 0;
const axios_1 = __importDefault(require("axios"));
const JobHandler_1 = require("../JobHandler");
const Job_1 = require("./Job");
class GotifyPushMessageJob extends Job_1.Job {
    constructor(httpAddress, healthAddress) {
        super();
        this.interval = 5000;
        this.retryLimit = 5;
        this.retryCounter = [];
        this.gotifyHealthTimeout = 500; // For better reaction in Case of unreachable Gotify-Server
        this.gotifyAddress = httpAddress;
        this.gotifyHealthAddress = healthAddress;
    }
    static pushMessage(message) {
        GotifyPushMessageJob.messages.push(message);
    }
    flushMessages() {
        let msgList = GotifyPushMessageJob.messages;
        GotifyPushMessageJob.messages = [];
        return msgList;
    }
    hasMessages() {
        return GotifyPushMessageJob.messages.length >= 1;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.targetHealth())) {
                this.addLog(JobHandler_1.LogLevel.ERROR, "Gotify target not ready: " + (this.gotifyHealthAddress || "undefined"));
                return;
            }
            if (this.hasMessages()) {
                let msgList = this.flushMessages();
                for (var i = 0; i < msgList.length; i++) {
                    yield this.sendMessage(msgList[i]);
                }
                this.addLog(JobHandler_1.LogLevel.INFO, "FINISHED sending " + msgList.length + " Meassages!");
            }
            else {
                this.addLog(JobHandler_1.LogLevel.INFO, "No Data send!");
            }
        });
    }
    targetHealth() {
        return __awaiter(this, void 0, void 0, function* () {
            let retVal = true;
            try {
                if (this.gotifyHealthAddress) {
                    //AXIOS cache prevention - adding GetValue timestampt to URL
                    let nUrl = this.gotifyHealthAddress + "?date=" + Date.now();
                    let resp = yield axios_1.default.get(nUrl, { timeout: this.gotifyHealthTimeout });
                    Object.entries(resp.data).forEach((keyVal) => {
                        retVal = (keyVal[1] == "green" && retVal);
                    });
                }
                else {
                    retVal = false;
                }
            }
            catch (err) {
                retVal = false;
            }
            return retVal;
        });
    }
    sendMessage(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let resp = yield axios_1.default.post(this.gotifyAddress + "?token=" + msg.token, {
                    "title": msg.title,
                    "message": msg.message,
                    "priority": msg.priority
                });
            }
            catch (err) {
                if (axios_1.default.isAxiosError(err) && err.response) {
                    if (this.checkRetry(msg)) {
                        GotifyPushMessageJob.pushMessage(msg);
                    }
                    else {
                        this.addLog(JobHandler_1.LogLevel.ERROR, { "data": msg, "err": err.toJSON }.toString());
                    }
                }
            }
        });
    }
    checkRetry(msg) {
        let count = this.retryCounter.filter((val) => val.id).length;
        if (count == -1) {
            this.retryCounter.push({ id: msg.id, count: 1 });
        }
        else if (count == this.retryLimit) {
            let index = this.retryCounter.findIndex((val) => val.id == msg.id);
            this.retryCounter.splice(index, 1);
            return false;
        }
        return true;
    }
}
exports.GotifyPushMessageJob = GotifyPushMessageJob;
GotifyPushMessageJob.messages = [];
