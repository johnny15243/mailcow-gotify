"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IWatchdogLog = exports.ISogoLog = exports.IRLLog = exports.IPostfixLog = exports.INetfilterLog = exports.IDovecotLog = exports.IAutodiscoverLog = exports.IAPILog = exports.IACMELog = exports.MailcowServices = void 0;
var MailcowServices;
(function (MailcowServices) {
    MailcowServices["ACME"] = "ACME";
    MailcowServices["API"] = "API";
    MailcowServices["AUTODISCOVER"] = "AUTODISCOVER";
    MailcowServices["DOVECOT"] = "DOVECOT";
    MailcowServices["NETFILTER"] = "NETFILTER";
    MailcowServices["POSTFIX"] = "POSTFIX";
    MailcowServices["SOGO"] = "SOGO";
    MailcowServices["WATCHDOG"] = "WATCHDOG";
    MailcowServices["RL"] = "RL";
})(MailcowServices = exports.MailcowServices || (exports.MailcowServices = {}));
// ACME_LOG
class IACMELog {
    get time() {
        return this._time || 0;
    }
    set time(val) {
        this._time = +val;
    }
}
exports.IACMELog = IACMELog;
// API_LOG
class IAPILog {
    get time() {
        return this._time || 0;
    }
    set time(val) {
        this._time = +val;
    }
}
exports.IAPILog = IAPILog;
// AUTODISCOVER_LOG
class IAutodiscoverLog {
    get time() {
        return this._time || 0;
    }
    set time(val) {
        this._time = +val;
    }
}
exports.IAutodiscoverLog = IAutodiscoverLog;
// DOVECOT_MAILLOG
class IDovecotLog {
    get time() {
        return this._time || 0;
    }
    set time(val) {
        this._time = +val;
    }
}
exports.IDovecotLog = IDovecotLog;
// NETFILTER_LOG
class INetfilterLog {
    get time() {
        return this._time || 0;
    }
    set time(val) {
        this._time = +val;
    }
}
exports.INetfilterLog = INetfilterLog;
// POSTFIX_MAILLOG
class IPostfixLog {
    get time() {
        return this._time || 0;
    }
    set time(val) {
        this._time = +val;
    }
}
exports.IPostfixLog = IPostfixLog;
// RL_LOG
class IRLLog {
    get time() {
        return this._time || 0;
    }
    set time(val) {
        this._time = +val;
    }
}
exports.IRLLog = IRLLog;
// SOGO_LOG
class ISogoLog {
    get time() {
        return this._time || 0;
    }
    set time(val) {
        this._time = +val;
    }
}
exports.ISogoLog = ISogoLog;
// WATCHDOG_LOG
class IWatchdogLog {
    get hpdiff() {
        return this._hpdiff || 0;
    }
    set hpdiff(val) {
        this._hpdiff = +val;
    }
    get hpnow() {
        return this._hpnow || 0;
    }
    set hpnow(val) {
        this._hpnow = +val;
    }
    get hptotal() {
        return this._hptotal || 0;
    }
    set hptotal(val) {
        this._hptotal = +val;
    }
    get time() {
        return this._time || 0;
    }
    set time(val) {
        this._time = +val;
    }
    get lvl() {
        return this._lvl || 0;
    }
    set lvl(val) {
        this._lvl = +val;
    }
}
exports.IWatchdogLog = IWatchdogLog;
