import Adapter from "./Adapter.js";
import Sound from "../sound.js";

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2021/1/15
 */

export default class AdapterAndroid extends Adapter {
    constructor(mock) {
        super();
        this.mock = mock;
    }

    saveConf() {
        if (this.mock) {
            super.saveConf();
            return;
        }

        document.location = "js://save?musicEnable=" + Sound.instance.musicEnable +
            "&soundEnable=" + Sound.instance.soundEnable +
            "&volume=" + Sound.instance.volume
    }
}