/**
 * @author 蒋文龙(Vin)
 * @description 支援微信和网页的差异化开发
 * @date 2020/5/28
 */

import Resource from "./resource.js";
import Common from "./common.js";

export default class Adapter {
    static instance = new Adapter();

    constructor() {

        /**
         * 0: web, 1: wx
         * @type {number}
         */
        this.platform = 0;


        this.stompClient = null;

        this.wxSocketStatus = false;
    }

    static setPlatform(platform) {
        this.instance.platform = platform;
    }

    static getSocketStatus() {
        if (this.instance.platform === 0) {
            return Adapter.getSocketStatusWeb();
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
        return Adapter.instance.wxSocketStatus;
    }

    static socketSend(type, value, sendTo) {
        if (this.instance.platform === 0) {
            Adapter.socketSendWeb(type, value, sendTo);
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

        wx.sendSocketMessage({
            data: msg
        })
    }

    static socketConnect(id, callBack) {
        if (this.instance.platform === 0) {
            Adapter.socketConnectWeb(id, callBack);
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

    static socketConnectWx(id, callback) {
        wx.connectSocket({
            url: 'ws://' + Resource.getHost() + '/ws?name=' + id
        });

        wx.onSocketOpen(function () {
            Adapter.instance.wxSocketStatus = true;
            callback();
        });

        wx.onSocketMessage(function (response) {
            Resource.getRoot().processSocketMessage(JSON.parse(response.data));
        });

        wx.onSocketClose(function () {
            Adapter.instance.wxSocketStatus = false;
        })
    }
}