/**
 * @author 蒋文龙(Vin)
 * @description 网页端入口
 * @date 2020/5/26
 */

import Resource from "../share/tool/resource.js";
import Control from "../share/tool/control.js";
import Root from "../share/root.js";
import Common from "../share/tool/common.js";
import AdapterManager from "../share/tool/adapter/AdapterManager.js";
import Sound from "../share/tool/sound.js";

export default class Index {
    constructor() {
        //加载字体
        const myFont = new FontFace('ZhenyanGB', 'url(font/RuiZiZhenYanTiMianFeiShangYong-2.ttf)');
        myFont.load().then(font => {
            document.fonts.add(font)
        });

        this.generateCanvas();

        this.root = new Root(this.ctx);
        Resource.setRoot(this.root);

        this.initGlobalConfig();
        this.initGame();
        this.initEvent();
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
        Common.initGame(() => {
            this.start();
        });
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
        const root = this.root;
        root.currentStage().init();

        //运算&绘制
        const draw = function () {
            root.update();
            root.draw();
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