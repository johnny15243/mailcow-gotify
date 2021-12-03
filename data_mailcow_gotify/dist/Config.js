"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Config {
    static loadCfg(cfgString) {
        try {
            JSON.parse(cfgString);
        }
        catch (e) {
            console.error(e);
        }
        return true;
    }
    get monitors() {
        return [];
    }
}
/*
        var danger_class = ["emerg", "alert", "crit", "err"];
        var warning_class = ["warning", "warn"];
        var info_class = ["notice", "info", "debug"];
        
*/ 
