"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logs = void 0;
const redis_1 = require("redis");
class Logs {
    constructor(rdOpts) {
        this.redisClient = new redis_1.RedisClient(rdOpts);
        this.redisClient.on("error", this.handleRedisErrors);
    }
    getDovecotLogs() {
        /**
        DOVECOT_MAILLOG
        [
        {
            "message": "managesieve-login: Disconnected (no auth attempts in 0 secs): user=<>, rip=172.22.1.3, lip=172.22.1.250",
            "priority": "info",
            "program": "dovecot",
            "time": "1569938740"
        }
        ]
         */
    }
    getPostfixLogs() {
        /**
        POSTFIX_MAILLOG
        [
        {
            "message": "EF1711500458: removed",
            "priority": "info",
            "program": "postfix/qmgr",
            "time": "1569937433"
        }
        ]
         */
    }
    getSoGoLogs() {
        /**
        SOGO_LOG
        [
        {
            "message": "[109]: mailcowdockerized_watchdog-mailcow_1.mailcowdockerized_mailcow-network \"GET /SOGo.index/ HTTP/1.1\" 200 2531/0 0.005 - - 0",
            "priority": "notice",
            "program": "sogod",
            "time": "1569938874"
        }
        ]
         */
    }
    getWatchdogLogs() {
        /**
        WATCHDOG_LOG
        [
        {
            "hpdiff": "0",
            "hpnow": "1",
            "hptotal": "1",
            "lvl": "100",
            "service": "Fail2ban",
            "time": "1569938958"
        },
        {
            "hpdiff": "0",
            "hpnow": "5",
            "hptotal": "5",
            "lvl": "100",
            "service": "Rspamd",
            "time": "1569938956"
        }
        ]
         */
    }
    getACMELogs() {
        /**
        ACME_LOG
        [
        {
            "message": "Certificate validation done, neither changed nor due for renewal, sleeping for another day.",
            "time": "1569927728"
        }
        ]
         */
    }
    getRLLogs() {
        /**
        RL_LOG
        [
        {
            "from": "awesome@mailcow.email",
            "header_from": "\"Awesome\" <awesome@mailcow.email>",
            "header_subject": "Mailcow is amazing",
            "ip": "172.22.1.248",
            "message_id": "6a-5d892500-7-240abd80@90879116",
            "qid": "E3CF91500458",
            "rcpt": "hello@mailcow.email",
            "rl_hash": "RLsdz3tuabozgd4oacbdh8kc78",
            "rl_info": "mailcow(RLsdz3tuabozgd4oacbdh8kc78)",
            "rl_name": "mailcow",
            "time": 1569269003,
            "user": "awesome@mailcow.email"
        }
        ]
         */
    }
    getAPILogs() {
        /**
        API_LOG
        [
        {
            "data": "",
            "method": "GET",
            "remote": "1.1.1.1",
            "time": 1569939001,
            "uri": "/api/v1/get/logs/api/2"
        }
        ]
         */
    }
    getNetfilterLogs() {
        /**
        NETFILTER_LOG
        [
        {
            "message": "Whitelist was changed, it has 1 entries",
            "priority": "info",
            "time": 1569754911
        },
        {
            "message": "Add host/network 1.1.1.1/32 to blacklist",
            "priority": "crit",
            "time": 1569754911
        }
        ]
         */
    }
    getAutodiscoverLogs() {
        /**
        AUTODISCOVER_LOG
        [
        {
            "time": 1569684212,
            "ua": "Microsoft Office/16.0 (Windows NT 6.2; MAPICPL 16.0.11328; Pro)",
            "user": "awesome@mailcow.de",
            "ip": "192.168.2.51",
            "service": "Error: must be authenticated"
        }
        ] */
    }
    handleRedisErrors(message) {
        console.error(message);
    }
}
exports.Logs = Logs;
