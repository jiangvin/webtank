import Resource from "../resource.js";
import Common from "../common.js";
import Home from "../../../web/home.js";
import Loading from "../../stage/loading.js";
import Sound from "../sound.js";

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/27
 */

export default class Adapter {
    constructor() {
        //在手机上禁用滑动
        this.lockTouchMoveEvent = function (e) {
            // 判断默认行为是否可以被禁用
            if (e.cancelable) {
                // 判断默认行为是否已经被禁用
                if (!e.defaultPrevented) {
                    e.preventDefault();
                }
            }
        }
    }

    initGame(callback) {
        this.initResource();
        Resource.getRoot().addStage(new Home());
        Resource.getRoot().addStage(new Loading());
        Resource.getRoot().addGameStage();
        callback();
    }

    initResource() {
        //load image
        Resource.instance.initImage();

        //load sound
        this.initSound();
    }

    initSound() {
        Sound.instance.loadedCount = 0;
        const event = function () {
            ++Sound.instance.loadedCount;
            if (Sound.instance.loadCallback) {
                Sound.instance.loadCallback(Sound.instance.loadedCount);
            }
        };
        createjs.Sound.alternateExtensions = ["mp3", "wav"];
        createjs.Sound.on("fileload", event, this);
        Sound.instance.sounds.forEach(function (sound) {
            createjs.Sound.registerSound(sound.src, sound.id);
            sound.play = function () {
                if (sound.loop) {
                    createjs.Sound.play(sound.id, {loop: -1});
                } else {
                    createjs.Sound.play(sound.id);
                }
            };
            sound.stop = function () {
                createjs.Sound.stop(sound.id);
            };
        });

        //实现声音函数
        createjs.Sound.volume = Sound.instance.volume;
        Sound.instance.setVolumeEngine = function (volume) {
            createjs.Sound.volume = volume;
        };

        //切换至后台时静音
        const handleVisibilityChange = () => {
            if (document.hidden) {
                //记录开始时间
                this.startTime = new Date().getTime();
                createjs.Sound.volume = 0;
            } else {
                createjs.Sound.volume = Sound.instance.volume;

                //检测时间，如果超过5分钟则重启
                //TODO - PC web有效，在安卓中会失效，暂无解决方案
                const currentTime = new Date().getTime();
                if (currentTime - this.startTime >= 5 * 60 * 1000) {
                    document.location.reload();
                }
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    lockTouchMove() {
        document.body.addEventListener('touchmove', this.lockTouchMoveEvent, {passive: false});
    }

    unlockTouchMove() {
        document.body.removeEventListener('touchmove', this.lockTouchMoveEvent);
    }

    getRequest(url, callback) {
        try {
            const xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState !== 4) {
                    return;
                }
                if (xmlHttp.status !== 200) {
                    Resource.getRoot().addMessage(xmlHttp.responseText, "#ff0000");
                    return;
                }

                const result = JSON.parse(xmlHttp.responseText);
                if (result.success) {
                    callback(result.data);
                } else {
                    Resource.getRoot().addMessage(result.message, "#ff0000");
                }
            };
            xmlHttp.open("GET", Common.generateHttpHost() + encodeURI(url), true); // true for asynchronous
            xmlHttp.send(null);
        } catch (e) {
            Resource.getRoot().addMessage(e, "#ff0000");
        }
    }

    postRequest(url, body, callback) {
        try {
            const xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState !== 4) {
                    return;
                }
                if (xmlHttp.status !== 200) {
                    Common.addMessage(xmlHttp.responseText, "#ff0000");
                    return;
                }

                const result = JSON.parse(xmlHttp.responseText);
                if (result.success) {
                    if (callback) {
                        callback(result.data);
                    }
                } else {
                    Common.addMessage(result.message, "#ff0000");
                }
            };
            xmlHttp.open("POST", Common.generateHttpHost() + encodeURI(url), true); // true for asynchronous
            xmlHttp.setRequestHeader('content-type', 'application/json');
            xmlHttp.send(JSON.stringify(body));
        } catch (e) {
            Common.addMessage(e, "#ff0000");
        }
    }

    /**
     * 网页模式不存缓存文件
     */
    saveConf() {
        console.log("mock save configuration");
    }

    inputSettingName() {
        const input = $("<input/>");
        input.attr("type", "text");
        input.attr("placeholder", "请输入称号");
        input.val(Resource.getUser().userId);
        input.addClass("setting-name");
        $("#main").append(input);
        return input;
    }

    inputRoomId() {
        const input = $("<input/>");
        input.attr("type", "text");
        input.attr("placeholder", "输入房间号或ID");
        input.addClass("input-room-name");
        $("#main").append(input);
        this.input = input;
        this.search = null;
    }

    inputDestroy() {
        $("#main").empty();
    }
}