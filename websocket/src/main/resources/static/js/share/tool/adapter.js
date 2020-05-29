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
    }

    static setPlatform(platform) {
        this.instance.platform = platform;
    }

    static socketEnable() {
        if (this.instance.platform === 0) {
            return Adapter.socketEnableWeb();
        }
    }

    static socketEnableWeb() {
        if (!Adapter.instance.stompClient) {
            return false;
        }
        return Adapter.instance.stompClient.connected;
    }

    static socketSend(type, value, sendTo) {
        if (this.instance.platform === 0) {
            Adapter.socketSendWeb(type, value, sendTo);
        }
    }

    static socketSendWeb(type, value, sendTo) {
        if (!Adapter.socketEnableWeb()) {
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

    static socketConnect(id, callBack) {
        if (this.instance.platform === 0) {
            Adapter.socketConnectWeb(id, callBack);
        } else {
            Adapter.socketConnectWx(id, callBack);
        }
    }

    static socketConnectWeb(id, callback) {
        const socket = new SockJS(encodeURI(Resource.getHost() + '/websocket-simple?name=' + id));
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
            url: 'ws://localhost/ws?name=' + id
        })
        wx.onSocketOpen(function (res) {
            console.log('WebSocket连接已打开！')
            wx.sendSocketMessage({data: "hello wx"})
        })

        wx.onSocketMessage(function (res) {
            console.log('收到onmessage事件:', res)
        })
    }
}