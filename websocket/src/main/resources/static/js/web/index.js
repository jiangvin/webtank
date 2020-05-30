/**
 * @author 蒋文龙(Vin)
 * @description 网页端入口
 * @date 2020/5/26
 */
import './libs/jquery.js'
import './libs/stomp.js'
import './libs/sockjs.js'

import Resource from "../share/tool/resource.js";
import Home from "../web/home.js"
import Menu from "../share/stage/menu.js";
import Control from "../share/tool/control.js";
import Room from "../share/stage/room.js"

export default class Index {
    constructor() {
        this.generateCanvas();
        Resource.setCanvas(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.root = Resource.getRoot();
        this.root.addStage(new Home());
        this.root.addStage(new Menu());
        this.root.addStage(new Room());

        this.initEvent();
        this.start();
    }

    initEvent() {
        //在手机上禁用滑动
        document.addEventListener('touchmove', function (e) {
            // 判断默认行为是否可以被禁用
            if (e.cancelable) {
                // 判断默认行为是否已经被禁用
                if (!e.defaultPrevented) {
                    e.preventDefault();
                }
            }
        }, false);
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
        //运算
        const index = this;
        const root = this.root;
        setInterval(function () {
            root.update();
        }, 17);

        //绘制
        const draw = function () {
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
    }
}

new Index();