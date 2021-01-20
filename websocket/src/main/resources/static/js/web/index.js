/**
 * @author 蒋文龙(Vin)
 * @description 网页端入口
 * @date 2020/5/26
 */

import Resource from "../share/tool/resource.js";
import Control from "../share/tool/control.js";
import Root from "../share/root.js";
import Loading from "./loading.js";
import AppHome from "../app/apphome.js";
import Home from "./home.js";
import Common from "../share/tool/common.js";
import AdapterManager from "../share/tool/adapter/AdapterManager.js";
import "../share/tool/context.js"
import Sound from "../share/tool/sound.js";

export default class Index {
    constructor() {
        this.generateCanvas();

        this.root = new Root();
        Resource.setRoot(this.root);
        this.initGame();
        this.initEvent();
        this.initGlobalConfig();
    }

    initGlobalConfig() {
        const debug = AdapterManager.getQueryString("debug");
        if (debug) {
            Resource.setDebug(debug);
            this.initTouchDebug();
        }
        const volume = AdapterManager.getQueryString("volume");
        if (volume) {
            Sound.setVolume(parseFloat(volume));
        }
        const musicEnable = AdapterManager.getQueryString("musicEnable");
        if (musicEnable) {
            Sound.setMusicEnable(musicEnable === "true");
        }
        const soundEnable = AdapterManager.getQueryString("soundEnable");
        if (soundEnable) {
            Sound.setSoundEnable(soundEnable === "true");
        }
    }

    initGame() {
        AdapterManager.checkPlatform();
        switch (AdapterManager.getPlatform()) {
            case "android":
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
                    this.start();
                });
                break;
            case "ios":
                Control.setControlMode(true);
                Common.getRequest("/user/getUser?userId=" + Resource.getUser().deviceId, data => {
                    if (data) {
                        //旧用户
                        Resource.setUser(data);
                        Resource.getRoot().addGameStage();
                    } else {
                        //新用户
                        Resource.getRoot().addStage(new AppHome());
                        Resource.getRoot().addGameStage();
                    }
                    this.start();
                });
                break;
            default:
                Resource.getRoot().addStage(new Home());
                Resource.getRoot().addStage(new Loading());
                Resource.getRoot().addGameStage();
                this.start();
                break;
        }
    }

    initTouchDebug() {
        document.addEventListener('touchstart', function (e) {
            for (let i = 0; i < e.touches.length; ++i) {
                const touchPoint = Control.getTouchPoint(e.touches[i]);
                console.log("point: " + touchPoint.x + "," + touchPoint.y);
            }
        });
    }

    initEvent() {
        Common.lockTouchMove();

        document.addEventListener('touchstart', function (e) {
            if (e.touches.length > 1) {
                // 判断默认行为是否可以被禁用
                if (e.cancelable) {
                    // 判断默认行为是否已经被禁用
                    if (!e.defaultPrevented) {
                        e.preventDefault();
                    }
                }
            }
        });
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (e) {
            let now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                // 判断默认行为是否可以被禁用
                if (e.cancelable) {
                    // 判断默认行为是否已经被禁用
                    if (!e.defaultPrevented) {
                        e.preventDefault();
                    }
                }
            }
            lastTouchEnd = now;
        }, false);
        document.addEventListener('gesturestart', function (e) {
            // 判断默认行为是否可以被禁用
            if (e.cancelable) {
                // 判断默认行为是否已经被禁用
                if (!e.defaultPrevented) {
                    e.preventDefault();
                }
            }
        });
    }

    start() {
        const index = this;
        const root = this.root;
        root.currentStage().init();

        //运算&绘制
        const draw = function () {
            root.update();

            index.ctx.clearRect(0, 0, Resource.width(), Resource.height());
            root.draw(index.ctx);
            root.drawHandler = requestAnimationFrame(draw);
        };
        root.drawHandler = requestAnimationFrame(draw);
    }

    generateCanvas() {
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext('2d');
        Resource.setCanvas(this.canvas);
        this.windowChange();
        window.addEventListener("resize", () => {
            this.windowChange();
        });
    }

    windowChange() {
        const info = Resource.calculateWindowInfo(
            document.documentElement.clientWidth,
            document.documentElement.clientHeight
        );
        this.canvas.width = info.displayW;
        this.canvas.height = info.displayH;

        let style = "";
        //变形的中心点为左上角
        style += "transform-origin: 0 0;";
        style += "width:" + info.displayW + "px;";
        style += "height:" + info.displayH + "px;";
        if (!info.isPortrait) {
            // 横屏
            style += "transform: rotate(0)";
        } else {
            // 竖屏
            style += "transform: rotate(90deg) translate(0px," + -info.realH + "px)";
        }
        style += " scale(" + info.scaleForDisplayToReal + ")";
        let wrapper = document.getElementById("wrapper");
        wrapper.style.cssText = style;

        //标准窗口的位移偏移
        style = "";
        style += "transform-origin: 0 0;";
        if (!info.formatWithWidth) {
            style += "transform: translateX(" + (Resource.getOffset().x * info.scaleForFormatToDisplay) + "px)"
        } else {
            style += "transform: translateY(" + (Resource.getOffset().y * info.scaleForFormatToDisplay) + "px)"
        }
        style += " scale(" + info.scaleForFormatToDisplay + ")";
        let main = document.getElementById("main");
        main.style.cssText = style;

        Control.setPortrait(info.isPortrait);
        //窗口变化时重新计算触控栏位置
        Control.generateTouchModeInfo();
    }
}
new Index();