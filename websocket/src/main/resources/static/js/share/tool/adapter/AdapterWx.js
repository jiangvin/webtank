/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2021/4/16
 */

import Adapter from "./Adapter.js";
import Resource from "../resource.js";
import Control from "../control.js";
import Sound from "../sound.js";
import Loading from "../../stage/loading.js";
import Login from "../../../wx/login.js";

export default class AdapterWx extends Adapter {
    constructor() {
        super();

        Resource.setHost("https://xiwen100.com/tank");
        Resource.setResourceHost("https://xiwen100.com/tank/");

        //模拟输入框
        this.inputIds = [];
    }

    initGame(callback) {
        this.initResource();
        Control.setControlMode(true);
        Control.setPortrait(true);
        Resource.getRoot().addStage(new Loading());
        //因为小程序需要额外页面来做微信登录
        Resource.getRoot().addStage(new Login());
        Resource.getRoot().addGameStage();
        callback();
    }

    initSound() {
        Sound.instance.loadedCount = 0;
        //加载进度相关
        const event = function () {
            if (Sound.instance.loadedCount >= Sound.instance.sounds.size) {
                return;
            }
            ++Sound.instance.loadedCount;
            if (Sound.instance.loadCallback) {
                Sound.instance.loadCallback(Sound.instance.loadedCount);
            }
        };

        Sound.instance.sounds.forEach(function (sound) {
            sound.instance = new Audio(Resource.instance.resourceHost + sound.src);
            if (sound.loop) {
                sound.instance.loop = true;
            }
            sound.play = function () {
                if (!sound.instance.ended) {
                    sound.stop();
                }
                sound.instance.play();
            };
            sound.stop = function () {
                sound.instance.pause();
                sound.instance.currentTime = 0;
            };

            if (sound.instance.readyState === 4) {
                event();
            } else {
                sound.instance.addEventListener("canplaythrough", function () {
                    event();
                }, false);
                sound.instance.load();
            }
        });

        Sound.instance.setVolumeEngine = function (volume) {
            Sound.instance.sounds.forEach(function (sound) {
                sound.instance.volume = volume;
            });
        };
    }

    inputSettingName(stage) {
        const item = stage.createItem({
            draw: function (ctx) {
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#7a5a31';
                ctx.displayGameText(Resource.getUser().userId, 594, 586, 30);
            }
        });
        this.inputIds[this.inputIds.length] = item.id;
    }

    inputRoomId() {

    }

    inputDestroy(stage) {
        this.inputIds.forEach(id => {
            stage.removeItemFromId(id);
        });
        this.inputIds = [];
    }
}