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

    const bindTouchEvent = function (controlMode) {
        window.addEventListener('touchend', function (e) {
        });
        window.addEventListener('touchmove', function (e) {
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
}