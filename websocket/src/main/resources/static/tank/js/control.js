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