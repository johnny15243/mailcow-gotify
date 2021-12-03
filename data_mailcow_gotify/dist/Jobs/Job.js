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
exports.Job = void 0;
const crypto_1 = require("crypto");
const JobHandler_1 = require("../JobHandler");
class Job {
    constructor() {
        this._id = (0, crypto_1.randomBytes)(16).toString("hex");
    }
    addLog(state = JobHandler_1.LogLevel.INFO, message) {
        let className = this.constructor.name;
        let newLog = {
            job: className,
            jobID: this._id,
            timestamp: Date.now(),
            status: state,
            message: message
        };
        JobHandler_1.JobHandler.addLog(newLog);
    }
    get id() {
        return this._id;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.intervalTimer = setInterval(this.execute.bind(this), this.interval);
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            clearInterval(this.intervalTimer);
        });
    }
}
exports.Job = Job;
