/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/28
 */

import Engine from "./engine.js";
import Common from "../tool/common.js";
import Resource from "../tool/resource.js";
import Status from "../tool/status.js";
import Adapter from "../tool/adapter.js";

export default class NetEngine extends Engine {
    constructor(room) {
        super(room);
        
        const thisEngine = this;
        
        //连接超时调用
        // Common.addConnectTimeoutEvent(function () {
        //     Common.lastStage();
        // });

        thisEngine.setUserId(function () {
            Adapter.socketConnect(Resource.getUser().userId, function () {

            })
        })
    }

    setUserId(callback) {
        Common.getRequest("/multiplePlayers/getUserId", function (userId) {
            Resource.setUserId(userId);
            callback();
        })
    }

    stompConnect(name, callback) {
        // const socket = new SockJS(encodeURI(Resource.getHost() + '/websocket-simple?name=' + name));
        // const thisEngine = this;
        // thisEngine.stompClient = Stomp.over(socket);
        // thisEngine.stompClient.connect({}, function (frame) {
        //     Common.addMessage("网络连接中: " + frame, "#ffffff");
        //
        //     // 客户端订阅消息, 公共消息和私有消息
        //     thisEngine.stompClient.subscribe('/topic/send', function (response) {
        //         Resource.getRoot().receiveStompMessage(JSON.parse(response.body));
        //     });
        //     thisEngine.stompClient.subscribe('/user/queue/send', function (response) {
        //         Resource.getRoot().receiveStompMessage(JSON.parse(response.body));
        //     });

            // thisEngine.addConnectCheckEvent();
            // callback();
        // });
    }

    /**
     * 每两秒确认一次连接是否失效
     */
    addConnectCheckEvent() {
        const thisEngine = this;
        const callBack = function () {
            if (thisEngine.getStompStatus() === true) {
                const start = new Date().getTime();
                Common.getRequest("/user/ping", function () {
                    Resource.getRoot().netDelay = new Date().getTime() - start;
                });
                Resource.getRoot().addTimeEvent("CONNECT_CHECK", callBack, 120, true);
            } else {
                Status.setStatus(Status.getStatusPause(), "与服务器断开！");

                //TODO 断线重连
            }
        };

        console.log("connect status will be checked per 120 frames...");
        Resource.getRoot().addTimeEvent("CONNECT_CHECK", callBack, 120);
    }

    getStompStatus() {
        if (!this.stompClient) {
            return false;
        }
        return this.stompClient.connected;
    }
}