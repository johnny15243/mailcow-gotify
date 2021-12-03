import { Job } from "./Jobs/Job";
import { IHash } from "./Models/Helper";

export enum LogLevel{
    ERROR,
    WARN,
    INFO,
    HEARTBEAT
}

export class JobHandler{

    private jobList: Job[] = [];

    public exists(identifier:Job|string):boolean{
        return this.getIndex(identifier)>=0;
    }

    private getIndex(identifier:Job|string):number{
        if(identifier instanceof Job){
            return this.jobList.indexOf(identifier);
        }else{
            return this.jobList.map((elem:Job)=>elem.id).indexOf(identifier);
        }
    }

    public add(newJob:Job): boolean {
        if(!this.exists(newJob)){
            newJob.start();
            this.jobList.push(newJob);
            return true;
        }else{
            return false;
        }
    }

    public remove(identifier:Job|string): boolean{
        let elemIndex = this.getIndex(identifier);
        if(elemIndex>=0){
            this.jobList[elemIndex].stop();
            this.jobList.splice(elemIndex, 1);
            return true;
        }else{
            return false;
        }
    }

    /**
     * jobLog
     */

    protected static _printLog: IJobLog[] = [];
    protected static printLogState:LogLevel[] = [LogLevel.ERROR];

    protected static lastJobHeartbeat:IHash<IJobLog> = {};
    protected static lastHeartbeatOutputTimestamp:number = Date.now();
    protected static lastHeartbeatPrintIntervall: number = 30000;

    public static addLog(nLog:IJobLog){
        if(JobHandler.printLogState.findIndex((value:LogLevel)=> nLog.status===value) >-1){
            JobHandler._printLog.push(nLog);
        }
        if(nLog.status === LogLevel.HEARTBEAT){
            JobHandler.lastJobHeartbeat[nLog.jobID] = nLog;
        }

    }



    public monitorJobs(states:LogLevel[]){
        JobHandler.printLogState = states;
        setInterval(this.printJobLogs,500);
    }

    private printJobLogs(){
        let logs:IJobLog[] = JobHandler._printLog;
        if(logs.length >= 1){
            JobHandler._printLog = [];
            logs.forEach((log:IJobLog)=>console.log(JSON.stringify(log)))
        }
        if((Date.now() - JobHandler.lastHeartbeatOutputTimestamp) >= JobHandler.lastHeartbeatPrintIntervall){
            let message:string = "HEARTBEAT - "+(new Date().toLocaleString("de-DE"))+"\nID\tJob\tLast heartbeat\n";
            Object.keys(JobHandler.lastJobHeartbeat).forEach((jobId:string) => {
                message = message + jobId+"\t"+(<IJobLog>JobHandler.lastJobHeartbeat[jobId]).job + "\t"+(new Date(JobHandler.lastJobHeartbeat[jobId].timestamp).toLocaleString('de-DE'))+"\n"
            });
            console.log(message);
            JobHandler.lastHeartbeatOutputTimestamp = Date.now();
        }
    }

}

export interface IJobLog{
    job:string;
    jobID:string;
    timestamp:number;
    status:LogLevel;
    message?:string;
}