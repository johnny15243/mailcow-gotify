import { randomBytes } from 'crypto';
import { IJobLog, JobHandler, LogLevel } from '../JobHandler';

export abstract class Job{
    private _id: string = randomBytes(16).toString("hex");
    protected abstract interval:number;
    private intervalTimer:NodeJS.Timer

    public addLog(state:LogLevel=LogLevel.INFO, message?:string){
        let className:string = this.constructor.name;
        let newLog:IJobLog = {
                job:className,
                jobID:this._id,
                timestamp:Date.now(),
                status:state,
                message:message
            };
        JobHandler.addLog(newLog);
    }

    public get id():string{
        return this._id;
    }

    protected abstract execute():Promise<any>;

    public async start(){
        this.intervalTimer = setInterval(this.execute.bind(this), this.interval);
    }

    public async stop(){
        clearInterval(this.intervalTimer);
    }


}