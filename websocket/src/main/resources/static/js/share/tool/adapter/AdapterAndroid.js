import Adapter from "./Adapter.js";
import Sound from "../sound.js";
import Control from "../control.js";
import Common from "../common.js";
import Resource from "../resource.js";
import Loading from "../../../web/loading.js";
import AppHome from "../../../app/apphome.js";

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

    initGame(callback) {
        Control.setControlMode(true);
        Common.getRequest("/user/getUser?userId=" + Resource.getUser().deviceId, data => {
            if (data) {
                //旧用户
                Resource.setUser(data);
                Resource.getRoot().addStage(new Loading());
                Resource.getRoot().addGameStage();
            } else {
                //新用户
                Resource.getRoot().addStage(new Loading());
                Resource.getRoot().addStage(new AppHome());
                Resource.getRoot().addGameStage();
            }
            callback();
        });
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