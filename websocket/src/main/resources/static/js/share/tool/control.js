/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/27
 */

import Resource from "./resource.js";
import Common from "./common.js";

export default class Control {
    static instance = new Control();

    constructor() {
        this.isTouchMode = null;

        //默认横屏
        this.portrait = false;
    }

    static setControlMode(isTouch) {
        Control.instance.isTouchMode = isTouch;
        if (isTouch) {
            document.addEventListener('touchstart', function (e) {
                const touchPoint = Control.getTouchPoint(e.touches[e.touches.length - 1]);
                Resource.getRoot().pointDownEvent(touchPoint);
                Common.addMessage(touchPoint.x + ":" + touchPoint.y);
            })
        } else {
            document.addEventListener('click', function (e) {
                const touchPoint = Control.getTouchPoint(e);
                Resource.getRoot().pointDownEvent(touchPoint);
                Common.addMessage(touchPoint.x + ":" + touchPoint.y);
            })
        }
    }

    static getTouchPoint(eventPoint) {
        let x = eventPoint.clientX;
        let y = eventPoint.clientY;

        //缩放处理
        const scale = Resource.getScale();

        const touchPoint = {};
        if (Control.instance.portrait) {
            //竖屏
            touchPoint.x = y;
            touchPoint.y = Common.height() * scale - x;
        } else {
            //横屏
            touchPoint.x = x;
            touchPoint.y = y;
        }

        touchPoint.x /= scale;
        touchPoint.y /= scale;

        return touchPoint;
    }

    static setPortrait(isPorTrait) {
        Control.instance.portrait = isPorTrait;
    }
}