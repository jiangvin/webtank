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
            Control.generateTouchModeInfo();
            document.addEventListener('touchstart', function (e) {
                const touchPoint = Control.getTouchPoint(e.touches[e.touches.length - 1]);
                Resource.getRoot().processPointDownEvent(touchPoint);
            })
        } else {
            document.addEventListener('click', function (e) {
                const touchPoint = Control.getTouchPoint(e);
                Resource.getRoot().processPointDownEvent(touchPoint);
            })
        }
    }

    static generateTouchModeInfo() {
        let centerX = Common.width() / 4 / 2;
        let centerY = Common.height() / 2 / 2;
        let radius = centerX > centerY ? centerY : centerX;
        centerY *= 3;

        let rightCenterX = centerX * 7;
        let rightCenterY = centerY;
        let rightRadius = radius * .7;

        if (centerX - radius < 20) {
            rightCenterX -= 20;
            centerX += 20;
        }
        if (Common.height() - centerY - radius < 20) {
            rightCenterY -= 20;
            centerY -= 20;
        }

        const thisControl = Control.instance;
        thisControl.controlMode = {};
        thisControl.controlMode.centerX = centerX;
        thisControl.controlMode.centerY = centerY;
        thisControl.controlMode.radius = radius;
        thisControl.controlMode.minRadius = radius / 3;
        thisControl.controlMode.maxRadius = radius * 1.5;

        thisControl.controlMode.rightCenterX = rightCenterX;
        thisControl.controlMode.rightCenterY = rightCenterY;
        thisControl.controlMode.rightRadius = rightRadius;

        thisControl.controlMode.hornCenterX = rightCenterX + rightRadius * 1.1;
        thisControl.controlMode.hornCenterY = rightCenterY - rightRadius;
        thisControl.controlMode.hornRadius = rightRadius * .4;
    };

    static draw(ctx) {
        if (!Control.instance.isTouchMode) {
            return;
        }

        //外圆
        const controlMode = Control.instance.controlMode;
        const control1 = Resource.getImage("control1");
        ctx.drawImage(control1,
            0, 0,
            control1.width, control1.height,
            controlMode.centerX - controlMode.radius, controlMode.centerY - controlMode.radius,
            controlMode.radius * 2, controlMode.radius * 2);

        //内圆
        let x = controlMode.touchX ? controlMode.touchX : controlMode.centerX;
        let y = controlMode.touchY ? controlMode.touchY : controlMode.centerY;
        const control2 = Resource.getImage("control2");
        const centerRadius = controlMode.radius / 2;
        ctx.drawImage(control2,
            0, 0,
            control2.width, control2.height,
            x - centerRadius, y - centerRadius,
            centerRadius * 2, centerRadius * 2);

        //右圆
        const fire = Resource.getImage("fire");
        ctx.drawImage(fire,
            0, 0,
            fire.width, fire.height,
            controlMode.rightCenterX - controlMode.rightRadius, controlMode.rightCenterY - controlMode.rightRadius,
            controlMode.rightRadius * 2, controlMode.rightRadius * 2);
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