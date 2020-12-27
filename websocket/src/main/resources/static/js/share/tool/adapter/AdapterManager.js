/**
 * @author 蒋文龙(Vin)
 * @description 支援各平台的差异化开发
 * @date 2020/5/28
 */
import Connect from "../connect.js";
import Resource from "../resource.js";
import WxInput from "../../../wx/wxinput.js";
import Adapter from "./Adapter.js";
import AdapterIos from "./AdapterIos.js";

export default class AdapterManager {

    constructor() {
        /**
         * 0: web, 1: wx, 2:android, 3:ios
         * @type {number}
         */
        this.platform = 0;

        //TODO 输入框相关，还未启用
        this.inputDisplay = false;
        this.inputEnable = false;
    }

    static checkPlatform() {
        const deviceId = AdapterManager.getQueryString("deviceId");
        const deviceName = AdapterManager.getQueryString("deviceName");
        const platform = AdapterManager.getQueryString("platform");

        //web
        if (deviceId === null || deviceName === null) {
            AdapterManager.initAdapter();
            return;
        }

        Resource.getUser().deviceId = deviceId;
        Resource.getUser().deviceName = deviceName;
        if (platform) {
            //ios
            AdapterManager.setPlatform(3);
        } else {
            //android
            AdapterManager.setPlatform(2);
        }

        AdapterManager.initAdapter();
    }

    static initAdapter() {
        Resource.instance.adapter = AdapterManager.generateInstance();
    }

    static generateInstance() {
        switch (AdapterManager.getPlatform()) {
            case "ios":
                return new AdapterIos();
            default:
                return new Adapter();
        }
    }

    static getQueryString(name) {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        let r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return decodeURIComponent(r[2]);
        }
        return null;
    }

    static setPlatform(platform) {
        this.instance.platform = platform;
    }

    static getPlatform() {
        switch (AdapterManager.instance.platform) {
            case 1:
                return "wx";
            case 2:
                return "android";
            case 3:
                return "ios";
            default:
                return "web";
        }
    }

    static initInput() {
        if (this.instance.platform === 0 || this.instance.platform === 2) {
            AdapterManager.initInputWeb();
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
                AdapterManager.inputMessageEvent(true);
            }
        });
    }

    static inputMessageEvent(inputFocus) {
        if (!this.instance.inputEnable) {
            return;
        }

        if (this.instance.platform === 1) {
            AdapterManager.inputMessageWxEvent();
        } else {
            AdapterManager.inputMessageWebEvent(inputFocus);
        }
    }

    static inputMessageWxEvent() {
        const obj = {};
        obj['defaultValue'] = "";
        obj['maxLength'] = 100;
        obj['multiple'] = false;
        obj['confirmHold'] = false;
        obj['confirmType'] = 'done';
        wx.showKeyboard(obj);
        wx.onKeyboardConfirm(function (result) {
            const text = result.value;
            if (text !== "") {
                Connect.send("USER_MESSAGE", text);
            }
            wx.offKeyboardConfirm(this);
        })
    }

    static inputMessageWebEvent(inputFocus) {
        const input = $('#input');
        if (AdapterManager.instance.inputDisplay) {
            //关闭输入框
            //关闭输入框前先处理文字信息
            const text = input.val();
            if (text !== "") {
                Connect.send("USER_MESSAGE", text);
                input.val("");
            }
            AdapterManager.instance.inputDisplay = false;
            document.getElementById('input').style.visibility = 'hidden';
        } else {
            //打开输入框
            AdapterManager.instance.inputDisplay = true;
            document.getElementById('input').style.visibility = 'visible';
            if (inputFocus) {
                input.focus();
            }
        }
    }

    /**
     * room name输入框
     */
    static createInputRoomName(x, y, parent) {
        if (AdapterManager.instance.platform === 1) {
            AdapterManager.createInputRoomNameWx(x, y, parent);
        } else {
            AdapterManager.createInputRoomNameWeb(x, y);
        }
    }

    static createInputRoomNameWx(x, y, parent) {
        parent[parent.length] = new WxInput(
            "input-room-name",
            x,
            y,
            220,
            47,
            "请输入房间名"
        );
    }

    static createInputRoomNameWeb(x, y) {
        let input = document.createElement('input');
        input.type = "text";
        input.id = "input-room-name";
        input.placeholder = "请输入房间名";
        input.className = "input-room-name";
        input.style.left = x + "px";
        input.style.top = y + "px";
        document.getElementById('wrapper').appendChild(input);
    }

    static getInputRoomName(parent) {
        if (AdapterManager.instance.platform === 1) {
            return AdapterManager.getInputRoomNameWx(parent);
        } else {
            return AdapterManager.getInputRoomNameWeb();
        }
    }

    static getInputRoomNameWeb() {
        return $('#input-room-name').val()
    }

    static getInputRoomNameWx(parent) {
        const input = parent.get("input-room-name");
        if (!input) {
            return "";
        }
        return input.text;
    }
}
AdapterManager.instance = new AdapterManager();