/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/27
 */

import Sound from "../tool/sound.js";
import Resource from "../tool/resource.js";

export default class ControlUnit {
    constructor(id, leftTop, rightBottom, callBack) {
        this.id = id;
        this.leftTop = leftTop;
        this.rightBottom = rightBottom;
        this.callBack = callBack;
        this.hasSound = true;

        /**
         * 是否根据16:9的画面做偏移
         * @type {boolean}
         */
        this.needOffset = true;

        this.enable = true;
    }

    process(point) {
        const leftTop = this.getLeftTop();
        const rightBottom = this.getRightBottom();

        if (point.x >= leftTop.x &&
            point.x <= rightBottom.x &&
            point.y >= leftTop.y &&
            point.y <= rightBottom.y) {
            this.callBack(point);
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
            pos.x = Resource.width() + pos.x;
        }
        if (pos.y < 0) {
            pos.y = Resource.height() + pos.y;
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