/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/27
 */

import Resource from "./resource.js";
import Common from "./common.js";
import Status from "./status.js";

export default class Control {

    constructor() {
        this.isTouchMode = false;
        this.portrait = false;

        //自定义事件
        this.customEventMap = new Map();
    }

    static setControlMode(isTouch) {
        Control.instance.isTouchMode = isTouch;
        if (isTouch) {
            Control.generateTouchModeInfo();
            document.addEventListener('touchstart', function (e) {
                for (let i = 0; i < e.touches.length; ++i) {
                    const touchPoint = Control.getTouchPoint(e.touches[i]);
                    Control.touchStartControl(touchPoint);
                    Resource.getRoot().processPointDownEvent(touchPoint);
                }
            });
            document.addEventListener('touchmove', function (e) {
                Control.touchMoveControl(e);
            });
            document.addEventListener('touchend', function (e) {
                Control.touchEndControl(e);
            });
        } else {
            Control.generateKeyModeInfo();
            document.addEventListener('mousedown', function (e) {
                const touchPoint = Control.getTouchPoint(e);
                Resource.getRoot().processPointDownEvent(touchPoint);
            });
            document.addEventListener("keydown", function (e) {
                Control.keyDownControl(e.key)
            });
            document.addEventListener("keyup", function (e) {
                Control.keyUpControl(e.key)
            });
        }
    }

    static keyUpControl(key) {
        const controlMode = Control.instance.controlMode;
        let event;
        switch (key) {
            case "ArrowUp":
            case "ArrowDown":
            case "ArrowLeft":
            case "ArrowRight":
            case "Up":
            case "Down":
            case "Left":
            case "Right":
                event = "Stop";
                break;
            default:
                break;
        }
        if (event !== undefined) {
            controlMode.keyDownSet.delete(key);
            //所有方向按键都松开才算停止
            if (controlMode.keyDownSet.size === 0) {
                Resource.getRoot().processControlEvent(event);
            }
        }
    }

    static keyDownControl(key) {
        const controlMode = Control.instance.controlMode;
        let event;
        switch (key) {
            case "Up":
            case "ArrowUp":
                event = "Up";
                break;
            case "Down":
            case "ArrowDown":
                event = "Down";
                break;
            case "Left":
            case "ArrowLeft":
                event = "Left";
                break;
            case "Right":
            case "ArrowRight":
                event = "Right";
                break;
            case " ":
            case "Spacebar":
                event = "FIRE";
                break;
            default:
                break;
        }
        if (event !== undefined) {
            if (event !== "FIRE" && !controlMode.keyDownSet.has(key)) {
                controlMode.keyDownSet.add(key);
            }
            Resource.getRoot().processControlEvent(event);
        }
    }

    static touchEndControl(e) {
        const controlMode = Control.instance.controlMode;
        let stop = true;
        for (let i = 0; i < e.touches.length; ++i) {
            const touchPoint = Control.getTouchPointWithoutScale(e.touches[i]);
            const distance = Common.distance(touchPoint.x, touchPoint.y, controlMode.centerX, controlMode.centerY);
            //还有手指在方向盘上，不停止
            if (distance <= controlMode.maxRadius) {
                stop = false;
                break;
            }
        }

        if (stop) {
            controlMode.touchX = null;
            controlMode.touchY = null;
            Resource.getRoot().processControlEvent("Stop");
        }
    }

    static touchMoveControl(e) {
        const controlMode = Control.instance.controlMode;

        //如果没有操作方向键，则返回
        if (controlMode.touchX == null || controlMode.touchY == null) {
            return;
        }

        //找寻操作点
        let touchMovePoint;
        let distance;
        for (let i = 0; i < e.touches.length; ++i) {
            const touchPoint = Control.getTouchPointWithoutScale(e.touches[i]);
            distance = Common.distance(touchPoint.x, touchPoint.y, controlMode.centerX, controlMode.centerY);
            if (distance <= controlMode.maxRadius) {
                touchMovePoint = touchPoint;
                break;
            }
        }
        if (!touchMovePoint) {
            return;
        }

        let x = touchMovePoint.x;
        let y = touchMovePoint.y;

        const radius = controlMode.radius;
        if (distance <= radius) {
            controlMode.touchX = x;
            controlMode.touchY = y;
        } else {
            //开始计算圆外的点和圆心连线的交点
            //先将圆心移动到坐标原点
            x = x - controlMode.centerX;
            y = y - controlMode.centerY;

            if (x === 0) {
                //x在坐标轴上，特殊处理，不能当公式分母
                y = y >= 0 ? radius : -radius;
            } else {
                let newX;
                let newY;
                newX = Math.sqrt(radius * radius * x * x / (x * x + y * y));
                newY = y * newX / x;
                if (x < 0) {
                    newX = -newX;
                    newY = -newY;
                }
                x = newX;
                y = newY;
            }

            //再将圆心移回去
            controlMode.touchX = x + controlMode.centerX;
            controlMode.touchY = y + controlMode.centerY;
        }

        //排除细微控制带来的干扰
        if (distance >= controlMode.minRadius) {
            Resource.getRoot().processControlEvent(Control.getControlEventFromTouch(controlMode));
        }
    }

    static touchStartControl(touchPoint) {
        let x = touchPoint.x * Resource.getScale();
        let y = touchPoint.y * Resource.getScale();
        const controlMode = Control.instance.controlMode;

        //fire
        let distance = Common.distance(x, y, controlMode.rightCenterX, controlMode.rightCenterY);
        if (distance < controlMode.rightRadius) {
            Resource.getRoot().processControlEvent("FIRE");
            return;
        }

        //如果已经在触控方向盘则不做额外触控操作
        if (controlMode.touchX && controlMode.touchY) {
            return;
        }

        //在屏幕的左半边触控则直接返回
        if (x >= Common.width() * .3) {
            return;
        }

        //过于靠边缘也直接返回
        if (x < controlMode.radius ||
            y < controlMode.radius ||
            y > Resource.height() - controlMode.radius) {
            return;
        }

        controlMode.touchX = x;
        controlMode.touchY = y;

        distance = Common.distance(x, y, controlMode.originCenterX, controlMode.originCenterY);
        if (distance <= controlMode.radius) {
            controlMode.centerX = controlMode.originCenterX;
            controlMode.centerY = controlMode.originCenterY;
            //排除细微控制带来的干扰
            if (distance >= controlMode.minRadius) {
                Resource.getRoot().processControlEvent(Control.getControlEventFromTouch(controlMode));
            }
        } else {
            controlMode.centerX = x;
            controlMode.centerY = y;
        }
    }

    static getControlEventFromTouch(controlMode) {
        let xLength = Math.abs(controlMode.touchX - controlMode.centerX);
        let yLength = Math.abs(controlMode.touchY - controlMode.centerY);
        if (xLength > yLength) {
            if (controlMode.touchX < controlMode.centerX) {
                return "Left";
            } else {
                return "Right";
            }
        } else {
            if (controlMode.touchY < controlMode.centerY) {
                return "Up";
            } else {
                return "Down";
            }
        }
    }

    static generateKeyModeInfo() {
        Control.instance.controlMode = {};
        Control.instance.controlMode.keyDownSet = new Set();
    }

    static generateTouchModeInfo() {
        if (!Control.instance.isTouchMode) {
            return;
        }

        let centerX = Resource.width() / 4 / 2;
        let centerY = Resource.height() / 2 / 2;
        let radius = 160 * Resource.getScale();
        centerY *= 3;

        let rightCenterX = centerX * 7;
        let rightCenterY = centerY;
        let rightRadius = radius * .7;

        if (centerX - radius < 20) {
            rightCenterX -= 20;
            centerX += 20;
        }
        if (Resource.height() - centerY - radius < 20) {
            rightCenterY -= 20;
            centerY -= 20;
        }

        const thisControl = Control.instance;
        thisControl.controlMode = {};

        //记录原始的位置
        thisControl.controlMode.originCenterX = centerX;
        thisControl.controlMode.originCenterY = centerY;

        thisControl.controlMode.centerX = centerX;
        thisControl.controlMode.centerY = centerY;
        thisControl.controlMode.radius = radius;
        thisControl.controlMode.minRadius = radius / 3;
        thisControl.controlMode.maxRadius = radius * 3;

        thisControl.controlMode.rightCenterX = rightCenterX;
        thisControl.controlMode.rightCenterY = rightCenterY;
        thisControl.controlMode.rightRadius = rightRadius;
    };

    static draw(ctx) {
        if (!Control.instance.isTouchMode) {
            return;
        }

        //外圆
        const controlMode = Control.instance.controlMode;
        let x = controlMode.touchX ? controlMode.centerX : controlMode.originCenterX;
        let y = controlMode.touchY ? controlMode.centerY : controlMode.originCenterY;
        const control1 = Resource.getOrCreateImage("control1");
        ctx.drawImage(control1,
            0, 0,
            control1.width, control1.height,
            x - controlMode.radius, y - controlMode.radius,
            controlMode.radius * 2, controlMode.radius * 2);

        //内圆
        x = controlMode.touchX ? controlMode.touchX : controlMode.originCenterX;
        y = controlMode.touchY ? controlMode.touchY : controlMode.originCenterY;
        const control2 = Resource.getOrCreateImage("control2");
        const centerRadius = controlMode.radius / 2;
        ctx.drawImage(control2,
            0, 0,
            control2.width, control2.height,
            x - centerRadius, y - centerRadius,
            centerRadius * 2, centerRadius * 2);

        if (!Status.isGaming()) {
            return;
        }

        //右圆
        const fire = Resource.getOrCreateImage("fire");
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
        const scale = Resource.instance.windowInfo.scaleForFormatToReal;

        const touchPoint = {};
        if (Control.instance.portrait) {
            //竖屏
            touchPoint.x = y;
            touchPoint.y = Resource.formatHeight(false) * scale - x;
        } else {
            //横屏
            touchPoint.x = x;
            touchPoint.y = y;
        }

        touchPoint.x /= scale;
        touchPoint.y /= scale;

        return touchPoint;
    }

    static getTouchPointWithoutScale(eventPoint) {
        const point = this.getTouchPoint(eventPoint);
        point.x *= Resource.getScale();
        point.y *= Resource.getScale();
        return point;
    }

    static setPortrait(isPorTrait) {
        Control.instance.portrait = isPorTrait;
    }

    static addMoveEvent(key, callback) {
        let event = {
            key: key
        };

        //generate event
        if (Control.instance.isTouchMode) {
            event.type = "touchmove";
            event.action = function (e) {
                const pointList = [];
                for (let i = 0; i < e.touches.length; ++i) {
                    pointList[pointList.length] = Control.getTouchPoint(e.touches[i]);
                }
                callback(pointList);
            }
        } else {
            event.type = "mousemove";
            event.action = function (e) {
                const pointList = [];
                pointList[0] = Control.getTouchPoint(e);
                callback(pointList);
            }
        }
        this.addEvent(event);
    }

    static addUpEvent(key, callback) {
        let event = {
            key: key,
            action: callback
        };

        //generate event
        if (Control.instance.isTouchMode) {
            event.type = "touchend";
        } else {
            event.type = "mouseup";
        }
        this.addEvent(event);
    }

    static addEvent(event) {
        this.removeEvent(event.key);
        Control.instance.customEventMap.set(event.key, event);
        document.addEventListener(event.type, event.action);
    }

    static removeEvent(key) {
        const event = Control.instance.customEventMap.get(key);
        if (!event) {
            return;
        }
        Control.instance.customEventMap.delete(key);
        document.removeEventListener(event.type, event.action);
    }
}
Control.instance = new Control();