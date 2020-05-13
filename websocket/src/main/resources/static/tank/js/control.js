/**
 * @author 蒋文龙(Vin)
 * @description 控制层
 * @date 2020/5/11
 */

{
    function Control() {
        this.controlMode = null;
    }

    Control.getControlMode = function () {
        return this.controlMode;
    };

    Control.createControlMode = function (isTouchMod) {
        if (!this.controlMode) {
            this.controlMode = {};
        }
        this.controlMode.touch = isTouchMod;

        const input = $('#input');
        if (isTouchMod) {
            input.attr("placeholder", "请输入信息,点击喇叭发送");
            bindTouchEvent(this.controlMode);
        } else {
            input.attr("placeholder", "请输入信息,回车发送");
            bindKeyboardEvent(this.controlMode);
        }

    };

    Control.generateTouchModeInfo = function (isPortrait) {
        let centerX = Common.width() / 4 / 2;
        let centerY = Common.height() / 2 / 2;
        let radius = centerX > centerY ? centerY : centerX;
        centerY *= 3;

        let rightCenterX = centerX * 7;
        let rightCenterY = centerY;
        let rightRadius = radius * .5;

        if (centerX - radius < 20) {
            rightCenterX -= 20;
            centerX += 20;
        }
        if (Common.height() - centerY - radius < 20) {
            rightCenterY -= 20;
            centerY -= 20;
        }

        if (!this.controlMode) {
            this.controlMode = {};
        }

        this.controlMode.centerX = centerX;
        this.controlMode.centerY = centerY;
        this.controlMode.radius = radius;
        this.controlMode.minRadius = radius / 2;
        this.controlMode.maxRadius = radius * 1.5;

        this.controlMode.rightCenterX = rightCenterX - rightRadius * .4;
        this.controlMode.rightCenterY = rightCenterY + rightRadius * .6;
        this.controlMode.rightRadius = rightRadius;

        this.controlMode.hornCenterX = rightCenterX + rightRadius;
        this.controlMode.hornCenterY = rightCenterY - rightRadius * .8;
        this.controlMode.hornRadius = rightRadius * .7;

        this.controlMode.portrait = isPortrait;
    };

    const bindTouchEvent = function (controlMode) {
        window.addEventListener('touchstart', function (e) {
            const touchPoint = Common.getTouchPoint(e.touches[e.touches.length - 1]);
            let x = touchPoint.x;
            let y = touchPoint.y;

            let distance = Common.distance(x, y, controlMode.rightCenterX, controlMode.rightCenterY);
            if (distance < controlMode.rightRadius) {
                Resource.getGame().controlEvent("FIRE");
                return;
            }

            distance = Common.distance(x, y, controlMode.centerX, controlMode.centerY);
            if (distance > controlMode.radius || distance < controlMode.minRadius) {
                //超过外圆或者低于最小控制距离，不做任何操作
                return;
            }

            controlMode.touchX = x;
            controlMode.touchY = y;
            Resource.getGame().controlEvent(getControlEventFromTouch(controlMode));
        });
        window.addEventListener('touchend', function (e) {
            let stop = true;
            for (let i = 0; i < e.touches.length; ++i) {
                const touchPoint = Common.getTouchPoint(e.touches[i]);
                const distance = Common.distance(touchPoint.x, touchPoint.y, controlMode.centerX, controlMode.centerY);
                //还有手指在方向盘上，不停止
                if (distance >= controlMode.minRadius && distance <= controlMode.maxRadius) {
                    stop = false;
                    break;
                }
            }

            if (stop) {
                controlMode.touchX = null;
                controlMode.touchY = null;
                Resource.getGame().controlEvent("Stop");
            }
        });
        window.addEventListener('touchmove', function (e) {
            let touchMovePoint;
            let distance;
            for (let i = 0; i < e.touches.length; ++i) {
                const touchPoint = Common.getTouchPoint(e.touches[i]);
                distance = Common.distance(touchPoint.x, touchPoint.y, controlMode.centerX, controlMode.centerY);
                if (distance >= controlMode.minRadius && distance <= controlMode.maxRadius) {
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
                if (controlMode.touchX == null || controlMode.touchY == null) {
                    //从头到尾都超过外圆，不做任何操作
                    return;
                }
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
            Resource.getGame().controlEvent(getControlEventFromTouch(controlMode));
        });
    };

    const bindKeyboardEvent = function (controlMode) {
        controlMode.keyDownSet = new Set();
        window.addEventListener("keydown", function (e) {
            let event;
            switch (e.key) {
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
                if (event !== "FIRE" && !controlMode.keyDownSet.has(e.key)) {
                    controlMode.keyDownSet.add(e.key);
                }
                Resource.getGame().controlEvent(event);
            }
        });
        window.addEventListener('keyup', function (e) {
            let event = null;
            switch (e.key) {
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
            if (event != null) {
                controlMode.keyDownSet.delete(e.key);
                //所有方向按键都松开才算停止
                if (controlMode.keyDownSet.size === 0) {
                    Resource.getGame().controlEvent(event);
                }
            }
        });
    };

    const getControlEventFromTouch = function (controlMode) {
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
}