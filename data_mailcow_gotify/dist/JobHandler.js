"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobHandler = exports.LogLevel = void 0;
const Job_1 = require("./Jobs/Job");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["HEARTBEAT"] = 3] = "HEARTBEAT";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
class JobHandler {
    constructor() {
        this.jobList = [];
    }
    exists(identifier) {
        return this.getIndex(identifier) >= 0;
    }
    getIndex(identifier) {
        if (identifier instanceof Job_1.Job) {
            return this.jobList.indexOf(identifier);
        }
        else {
            return this.jobList.map((elem) => elem.id).indexOf(identifier);
        }
    }
    add(newJob) {
        if (!this.exists(newJob)) {
            newJob.start();
            this.jobList.push(newJob);
            return true;
        }
        else {
            return false;
        }
    }
    remove(identifier) {
        let elemIndex = this.getIndex(identifier);
        if (elemIndex >= 0) {
            this.jobList[elemIndex].stop();
            this.jobList.splice(elemIndex, 1);
            return true;
        }
        else {
            return false;
        }
    }
    static addLog(nLog) {
        if (JobHandler.printLogState.findIndex((value) => nLog.status === value) > -1) {
            JobHandler._printLog.push(nLog);
        }
        if (nLog.status === LogLevel.HEARTBEAT) {
            JobHandler.lastJobHeartbeat[nLog.jobID] = nLog;
        }
    }
    monitorJobs(states) {
        JobHandler.printLogState = states;
        setInterval(this.printJobLogs, 500);
    }
    printJobLogs() {
        let logs = JobHandler._printLog;
        if (logs.length >= 1) {
            JobHandler._printLog = [];
            logs.forEach((log) => console.log(JSON.stringify(log)));
        }
        if ((Date.now() - JobHandler.lastHeartbeatOutputTimestamp) >= JobHandler.lastHeartbeatPrintIntervall) {
            let message = "HEARTBEAT - " + (new Date().toLocaleString("de-DE")) + "\nID\tJob\tLast heartbeat\n";
            Object.keys(JobHandler.lastJobHeartbeat).forEach((jobId) => {
                message = message + jobId + "\t" + JobHandler.lastJobHeartbeat[jobId].job + "\t" + (new Date(JobHandler.lastJobHeartbeat[jobId].timestamp).toLocaleString('de-DE')) + "\n";
            });
            console.log(message);
            JobHandler.lastHeartbeatOutputTimestamp = Date.now();
        }
    }
}
exports.JobHandler = JobHandler;
/**
 * jobLog
 */
JobHandler._printLog = [];
JobHandler.printLogState = [LogLevel.ERROR];
JobHandler.lastJobHeartbeat = {};
JobHandler.lastHeartbeatOutputTimestamp = Date.now();
JobHandler.lastHeartbeatPrintIntervall = 30000;
