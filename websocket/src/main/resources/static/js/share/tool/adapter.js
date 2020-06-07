/**
 * @author 蒋文龙(Vin)
 * @description 支援微信和网页的差异化开发
 * @date 2020/5/28
 */

import Resource from "./resource.js";
import Common from "./common.js";

export default class Adapter {

    constructor() {

        /**
         * 0: web, 1: wx
         * @type {number}
         */
        this.platform = 0;

        this.stompClient = null;
        this.socketClient = null;
        this.webConnectRule = null;

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
                Adapter.socketSend("USER_MESSAGE", text);
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

    static getSocketStatus() {
        if (this.instance.platform === 0) {
            switch (this.instance.webConnectRule) {
                case 1:
                    return Adapter.getSocketStatusWeb();
                case 2:
                    return Adapter.getSocketStatusWx();
                default:
                    return false;
            }
        } else {
            return Adapter.getSocketStatusWx();
        }
    }

    static getSocketStatusWeb() {
        if (!Adapter.instance.stompClient) {
            return false;
        }
        return Adapter.instance.stompClient.connected;
    }

    static getSocketStatusWx() {
        if (!Adapter.instance.socketClient) {
            return false;
        }

        return Adapter.instance.socketClient.readyState === WebSocket.OPEN;
    }

    static socketSend(type, value, sendTo) {
        if (this.instance.platform === 0) {
            switch (this.instance.webConnectRule) {
                case 1:
                    Adapter.socketSendWeb(type, value, sendTo);
                    break;
                case 2:
                    Adapter.socketSendWx(type, value, sendTo);
                    break;
            }
        } else {
            Adapter.socketSendWx(type, value, sendTo);
        }
    }

    static socketSendWeb(type, value, sendTo) {
        if (!Adapter.getSocketStatusWeb()) {
            return;
        }

        if (!type) {
            type = "USER_MESSAGE";
        }

        Adapter.instance.stompClient.send("/send", {},
            JSON.stringify({
                "message": value,
                "messageType": type,
                "sendTo": sendTo
            }));
    }

    static socketSendWx(type, value, sendTo) {
        if (!Adapter.getSocketStatusWx()) {
            return;
        }

        if (!type) {
            type = "USER_MESSAGE";
        }

        let msg = JSON.stringify({
            "message": value,
            "messageType": type,
            "sendTo": sendTo
        });

        Adapter.instance.socketClient.send(msg);
    }

    static stopConnect() {
        if (Adapter.getSocketStatusWx()) {
            Adapter.instance.socketClient.close();
        }
        if (Adapter.getSocketStatusWeb()) {
            Adapter.instance.stompClient.disconnect();
        }
    }

    static socketConnect(id, callBack) {
        Adapter.stopConnect();

        if (this.instance.platform === 0) {
            if (this.instance.webConnectRule === null) {
                this.instance.webConnectRule = 2;
            } else {
                this.instance.webConnectRule = this.instance.webConnectRule % 2 + 1;
            }
            switch (this.instance.webConnectRule) {
                case 1:
                    Adapter.socketConnectWeb(id, callBack);
                    break;
                case 2:
                    Adapter.socketConnectWx(id, callBack);
                    break;
            }
        } else {
            Adapter.socketConnectWx(id, callBack);
        }
    }

    static socketConnectWeb(id, callback) {
        const socket = new SockJS(encodeURI(Common.generateHttpHost() + '/websocket-simple?name=' + id));
        const thisAdapter = Adapter.instance;
        thisAdapter.stompClient = Stomp.over(socket);
        thisAdapter.stompClient.connect({}, function (frame) {
            Common.addMessage("网络连接中: " + frame, "#ffffff");

            // 客户端订阅消息, 公共消息和私有消息
            thisAdapter.stompClient.subscribe('/topic/send', function (response) {
                Resource.getRoot().processSocketMessage(JSON.parse(response.body));
            });
            thisAdapter.stompClient.subscribe('/user/queue/send', function (response) {
                Resource.getRoot().processSocketMessage(JSON.parse(response.body));
            });

            callback();
        });
    }

    static generateSocketHost() {
        if (Resource.getHost() === "") {
            return "ws://" + document.location.host;
        } else {
            return 'ws://' + Resource.getHost();
        }
    }

    static socketConnectWx(id, callback) {
        Adapter.instance.socketClient = new WebSocket(Adapter.generateSocketHost() + '/ws?name=' + id);

        Adapter.instance.socketClient.onopen = function () {
            Common.addMessage("与服务器连接中...", "#ffffff");
            callback();
        };

        Adapter.instance.socketClient.onerror = function (response) {
            Common.addMessage("websocket error:" + response, "#F00");
        };

        Adapter.instance.socketClient.onmessage = function (response) {
            Resource.getRoot().processSocketMessage(JSON.parse(response.data));
        };

        Adapter.instance.socketClient.onclose = function () {

        };
    }
}
Adapter.instance = new Adapter();