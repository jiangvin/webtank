/**
 * @author 蒋文龙(Vin)
 * @description 网页端入口
 * @date 2020/5/26
 */

import Resource from "../share/tool/resource.js";
import Home from "../web/home.js"
import Menu from "../share/stage/menu.js";
import Control from "../share/tool/control.js";
import Room from "../share/stage/room.js"
import Root from "../share/root.js";
import Adapter from "../share/tool/adapter.js";
import Common from "../share/tool/common.js";
import AppHome from "../app/apphome.js";

export default class Index {
    constructor() {
        this.generateCanvas();
        Resource.setCanvas(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.root = new Root();
        Resource.setRoot(this.root);
        const thisIndex = this;
        if (Adapter.isApp()) {
            Common.getRequest("/user/getUser?userId=" + Resource.getUser().deviceId, function (data) {
                if (data) {
                    //旧用户
                    Resource.setUser(data);

                    thisIndex.root.addStage(new Menu());
                    thisIndex.root.addStage(new Room());
                    thisIndex.initEvent();
                    thisIndex.start();
                } else {
                    //新用户
                    thisIndex.root.addStage(new AppHome());
                    thisIndex.root.addStage(new Menu());
                    thisIndex.root.addStage(new Room());
                    thisIndex.initEvent();
                    thisIndex.start();
                }
            })
        } else {
            //web
            this.root.addStage(new Home());
            this.root.addStage(new Menu());
            this.root.addStage(new Room());
            this.initEvent();
            this.start();
        }
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

        const newWidth = width / scale;
        const newHeight = height / scale;
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
        Control.setPortrait(height > width);
        //窗口变化时重新计算触控栏位置
        Control.generateTouchModeInfo();
    }
}

Resource.preloadResource(function () {
    new Index();
});