/**
 * @author 蒋文龙(Vin)
 * @description 网页端入口
 * @date 2020/5/26
 */

import Resource from "../share/tool/resource.js";
import Home from "../web/home.js"
import Control from "../share/tool/control.js";
import Root from "../share/root.js";
import Adapter from "../share/tool/adapter.js";
import Common from "../share/tool/common.js";
import AppHome from "../app/apphome.js";
import Loading from "./loading.js";

export default class Index {
    constructor() {
        this.initEvent();

        this.generateCanvas();
        Resource.setCanvas(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.root = new Root();
        Resource.setRoot(this.root);

        const debug = Adapter.getQueryString("debug");
        if (debug) {
            Resource.setDebug(debug);
            this.initTouchDebug();
        }

        if (Adapter.isApp()) {
            Control.setControlMode(true);
            Common.getRequest("/user/getUser?userId=" + Resource.getUser().deviceId, data => {
                if (data) {
                    //旧用户
                    Resource.setUser(data);

                    this.root.addStage(new Loading());
                    this.root.addGameStage();
                    this.start();
                } else {
                    //新用户
                    this.root.addStage(new Loading());
                    this.root.addStage(new AppHome());
                    this.root.addGameStage();
                    this.start();
                }
            })
        } else {
            //web
            this.root.addStage(new Home());
            this.root.addStage(new Loading());
            this.root.addGameStage();
            this.start();
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
        //在手机上禁用滑动
        document.body.addEventListener('touchmove', function (e) {
            // 判断默认行为是否可以被禁用
            if (e.cancelable) {
                // 判断默认行为是否已经被禁用
                if (!e.defaultPrevented) {
                    e.preventDefault();
                }
            }
        }, {passive: false});
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
        this.windowChange();
        const thisIndex = this;
        window.addEventListener("resize", function () {
            thisIndex.windowChange();
        });
    }

    windowChange() {
        const width = document.documentElement.clientWidth;
        const height = document.documentElement.clientHeight;
        const scale = Resource.calculateScale(width, height);

        let newWidth = Math.round(width / scale);
        let newHeight = Math.round(height / scale);

        //减小精度误差
        if (Math.abs(newWidth - Resource.displayW()) < 2) {
            newWidth = Resource.displayW();
        }
        if (Math.abs(newHeight - Resource.displayH()) < 2) {
            newHeight = Resource.displayH();
        }
        
        let style = "";
        //变形的中心点为左上角
        style += "-webkit-transform-origin: 0 0;";
        style += "transform-origin: 0 0;";
        if (width >= height) {
            // 横屏
            style += "width:" + newWidth + "px;";
            style += "height:" + newHeight + "px;";
            style += "-webkit-transform: rotate(0) scale(" + scale + ");";
            style += "transform: rotate(0) scale(" + scale + ");";
            this.canvas.width = newWidth;
            this.canvas.height = newHeight;
        } else {
            // 竖屏
            style += "width:" + newHeight + "px;";
            style += "height:" + newWidth + "px;";
            style += "-webkit-transform: rotate(90deg) scale(" + scale + ") translate(0px," + -newWidth + "px);";
            style += "transform: rotate(90deg) scale(" + scale + ") translate(0px," + -newWidth + "px);";
            this.canvas.width = newHeight;
            this.canvas.height = newWidth;
        }
        let wrapper = document.getElementById("wrapper");
        wrapper.style.cssText = style;

        //标准窗口的位移偏移
        let main = document.getElementById("main");
        if (Resource.getOffset().x) {
            main.style.cssText = "transform: translateX(" + Resource.getOffset().x + "px);"
        } else {
            main.style.cssText = "transform: translateY(" + Resource.getOffset().y + "px);"
        }

        Control.setPortrait(height > width);
        //窗口变化时重新计算触控栏位置
        Control.generateTouchModeInfo();
    }
}
new Index();