import { RedisClient, ClientOpts, createClient } from "redis";
import { IJobLog, LogLevel } from "../JobHandler";
import { Job } from "./Job";

export class RedisConnectJob extends Job{
    protected interval: number = 100;

    private static _connection: RedisClient;
    private static _instance: RedisConnectJob;

    private constructor() {
        super();
    }

    public static getInstance(conf?:ClientOpts): RedisConnectJob{
        if(RedisConnectJob._instance){
            return RedisConnectJob._instance;
        }else{
            RedisConnectJob._instance = new RedisConnectJob();
            RedisConnectJob._instance.createConnection(conf)
            return RedisConnectJob._instance;
        }
    }

    protected createConnection(conf?:ClientOpts){
        if(!RedisConnectJob._connection || RedisConnectJob._connection?.connected ){    
            RedisConnectJob._connection = (!conf)? createClient() : createClient(conf);
            this.setEvents();
        }
    }

    protected setEvents(){
        RedisConnectJob._connection.on("error", 
            function(error:any) {
                RedisConnectJob.getInstance().addLog(LogLevel.ERROR, error.toString());
            });

            RedisConnectJob._connection.on("end",
                ()=> RedisConnectJob.getInstance().addLog(LogLevel.ERROR, "REDIS connection END!") 
            );
            RedisConnectJob._connection.on("warning",
                (msg)=> RedisConnectJob.getInstance().addLog(LogLevel.WARN, msg.toString()) 
            );
    }

    protected async execute(){
        if(RedisConnectJob._connection?.connected){
            this.addLog(LogLevel.HEARTBEAT);
        }else if(RedisConnectJob._connection?.connected){
            this.addLog(LogLevel.ERROR, "Disconnected")
        }
    }

    public static get redisConnection():RedisClient{
        return RedisConnectJob._connection;
    }

    

}