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
        Common.addConnectTimeoutEvent(function () {
            Common.lastStage();
        });

        thisEngine.setUserId(function () {
            Adapter.socketConnect(Resource.getUser().userId, function () {

                //注册延时事件
                Common.addTimeEvent("CLIENT_READY", function () {
                    Adapter.socketSend("CLIENT_READY", {
                        username: Resource.getUser().username
                    })
                },40);

                //注册消息事件
                Common.addMessageEvent("SERVER_READY", function () {
                    if (Status.getValue() !== Status.statusPause()) {
                        return;
                    }

                    thisEngine.addConnectCheckEvent();
                    Status.setStatus(Status.statusNormal());
                })
            })
        })
    }

    setUserId(callback) {
        Common.getRequest("/multiplePlayers/getUserId?userId=" + Resource.getUser().userId, function (userId) {
            Resource.setUserId(userId);
            callback();
        })
    }

    /**
     * 每两秒确认一次连接是否失效
     */
    addConnectCheckEvent() {
        const callBack = function () {
            if (Adapter.getSocketStatus() === true) {
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