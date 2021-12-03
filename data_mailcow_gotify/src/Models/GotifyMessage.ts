const { randomBytes } = require('crypto');

export class GotifyMessage{
    private _id:string;
    private _timestamp: number;
    priority: number;
    title: string;
    message: string;
    token: string;

    constructor(){
        this._id = randomBytes(16).toString("hex");
        this.timestamp = Date.now();
    }

    public get id():string{
        return this._id;
    }

    private set id(nid:string){
        this._id = nid;
    }

    public get timestamp():number{
        return this._timestamp;
    }

    private set timestamp(nTimestamp:number){
        this._timestamp = nTimestamp;
    }


}