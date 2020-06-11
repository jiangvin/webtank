/**
 * @author 蒋文龙(Vin)
 * @description 支援微信和网页的差异化开发
 * @date 2020/5/28
 */
import Connect from "./connect.js";

export default class Adapter {

    constructor() {

        /**
         * 0: web, 1: wx
         * @type {number}
         */
        this.platform = 0;

        /**
         * input
         * @type {boolean}
         */
        this.inputEnable = false;
    }

    static setPlatform(platform) {
        this.instance.platform = platform;
    }

    static initInput() {
        if (this.instance.platform === 0) {
            Adapter.initInputWeb();
        }
    }

    static initInputWeb() {
        const input = $('#input');
        input.val("");
        input.attr("placeholder", "请输入消息");
        input.removeClass("input-name");
        input.addClass("input-message");
        document.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                Adapter.inputMessageWebEvent(true);
            }
        });
    }

    static inputMessageWebEvent(inputFocus) {
        const input = $('#input');
        if (Adapter.instance.inputEnable) {
            //关闭输入框
            //关闭输入框前先处理文字信息
            const text = input.val();
            if (text !== "") {
                Connect.send("USER_MESSAGE", text);
                input.val("");
            }
            Adapter.instance.inputEnable = false;
            document.getElementById('input').style.visibility = 'hidden';
        } else {
            //打开输入框
            Adapter.instance.inputEnable = true;
            document.getElementById('input').style.visibility = 'visible';
            if (inputFocus) {
                input.focus();
            }
        }
    }
}
Adapter.instance = new Adapter();