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
exports.RedisConnectJob = void 0;
const redis_1 = require("redis");
const JobHandler_1 = require("../JobHandler");
const Job_1 = require("./Job");
class RedisConnectJob extends Job_1.Job {
    constructor() {
        super();
        this.interval = 100;
    }
    static getInstance(conf) {
        if (RedisConnectJob._instance) {
            return RedisConnectJob._instance;
        }
        else {
            RedisConnectJob._instance = new RedisConnectJob();
            RedisConnectJob._instance.createConnection(conf);
            return RedisConnectJob._instance;
        }
    }
    createConnection(conf) {
        var _a;
        if (!RedisConnectJob._connection || ((_a = RedisConnectJob._connection) === null || _a === void 0 ? void 0 : _a.connected)) {
            RedisConnectJob._connection = (!conf) ? (0, redis_1.createClient)() : (0, redis_1.createClient)(conf);
            this.setEvents();
        }
    }
    setEvents() {
        RedisConnectJob._connection.on("error", function (error) {
            RedisConnectJob.getInstance().addLog(JobHandler_1.LogLevel.ERROR, error.toString());
        });
        RedisConnectJob._connection.on("end", () => RedisConnectJob.getInstance().addLog(JobHandler_1.LogLevel.ERROR, "REDIS connection END!"));
        RedisConnectJob._connection.on("warning", (msg) => RedisConnectJob.getInstance().addLog(JobHandler_1.LogLevel.WARN, msg.toString()));
    }
    execute() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if ((_a = RedisConnectJob._connection) === null || _a === void 0 ? void 0 : _a.connected) {
                this.addLog(JobHandler_1.LogLevel.HEARTBEAT);
            }
            else if ((_b = RedisConnectJob._connection) === null || _b === void 0 ? void 0 : _b.connected) {
                this.addLog(JobHandler_1.LogLevel.ERROR, "Disconnected");
            }
        });
    }
    static get redisConnection() {
        return RedisConnectJob._connection;
    }
}
exports.RedisConnectJob = RedisConnectJob;
