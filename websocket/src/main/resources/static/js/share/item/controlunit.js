/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/27
 */

import Sound from "../tool/sound.js";
import Resource from "../tool/resource.js";

export default class ControlUnit {
    constructor(options) {
        this.id = Resource.generateClientId();
        this.leftTop = {x: 0, y: 0};
        this.rightBottom = {x: 500, y: 500};
        this.callback = null;
        this.hasSound = true;

        /**
         * 是否根据16:9的画面做偏移
         * @type {boolean}
         */
        this.needOffset = Resource.getNeedOffset();

        this.enable = true;

        for (let key in options) {
            this[key] = options[key];
        }

        //根据长宽重新计算右下角的位置
        if (options.size) {
            if (options.center) {
                this.leftTop = {
                    x: options.center.x - options.size.w / 2,
                    y: options.center.y - options.size.h / 2
                }
            }
            this.rightBottom = {
                x: this.leftTop.x + options.size.w,
                y: this.leftTop.y + options.size.h
            }
        }
    }

    process(point) {
        const leftTop = this.getLeftTop();
        const rightBottom = this.getRightBottom();

        if (point.x >= leftTop.x &&
            point.x <= rightBottom.x &&
            point.y >= leftTop.y &&
            point.y <= rightBottom.y) {
            this.callback(point);
            if (this.hasSound) {
                Sound.click();
            }
            return true;
        } else {
            return false;
        }
    }

    getLeftTop() {
        return this.getPos(this.leftTop);
    }

    getRightBottom() {
        return this.getPos(this.rightBottom);
    }

    getPos(point) {
        const pos = {
            x: point.x,
            y: point.y
        };
        if (pos.x < 0) {
            pos.x = Resource.formatWidth() + pos.x;
        }
        if (pos.y < 0) {
            pos.y = Resource.formatHeight() + pos.y;
        }

        const offset = this.getOffset();
        pos.x += offset.x;
        pos.y += offset.y;
        return pos;
    }

    getOffset() {
        if (this.needOffset) {
            return Resource.getOffset();
        } else {
            return {
                x: 0,
                y: 0
            }
        }
    }
}