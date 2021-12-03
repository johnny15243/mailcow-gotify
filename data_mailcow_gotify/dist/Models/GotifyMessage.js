"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GotifyMessage = void 0;
const { randomBytes } = require('crypto');
class GotifyMessage {
    constructor() {
        this._id = randomBytes(16).toString("hex");
        this.timestamp = Date.now();
    }
    get id() {
        return this._id;
    }
    set id(nid) {
        this._id = nid;
    }
    get timestamp() {
        return this._timestamp;
    }
    set timestamp(nTimestamp) {
        this._timestamp = nTimestamp;
    }
}
exports.GotifyMessage = GotifyMessage;
