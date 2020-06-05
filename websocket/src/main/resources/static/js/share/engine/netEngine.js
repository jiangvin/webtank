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

        thisEngine.setUserId(function () {
            Adapter.socketConnect(Resource.getUser().userId, function () {

                //注册延时事件
                Common.addTimeEvent("CLIENT_READY", function () {
                    Adapter.socketSend("CLIENT_READY", {
                        username: Resource.getUser().username
                    })
                }, 40);

                //create room
                if (!room.roomInfo.joinRoom) {
                    Common.addTimeEvent("CREATE_ROOM", function () {
                        Adapter.socketSend("CREATE_ROOM", {
                            "roomId": thisEngine.room.roomInfo.roomId,
                            "mapId": thisEngine.room.roomInfo.mapId,
                            "roomType": thisEngine.room.roomInfo.roomType,
                            "joinTeamType": thisEngine.room.roomInfo.joinTeamType
                        })
                    }, 50);
                } else {
                    //join room
                    Common.addTimeEvent("JOIN_ROOM", function () {
                        Adapter.socketSend("JOIN_ROOM", {
                            "roomId": thisEngine.room.roomInfo.roomId,
                            "joinTeamType": thisEngine.room.roomInfo.joinTeamType
                        })
                    }, 50);
                }

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
                Common.getRequest("/multiplePlayers/ping", function () {
                    Resource.getRoot().netDelay = new Date().getTime() - start;
                });
                Resource.getRoot().addTimeEvent("CONNECT_CHECK", callBack, 120, true);
            } else {
                Status.setStatus(Status.statusPause(), "与服务器断开！", true);

                //TODO 断线重连
            }
        };

        console.log("connect status will be checked per 120 frames...");
        Resource.getRoot().addTimeEvent("CONNECT_CHECK", callBack, 120);
    }

    processControlEvent(control) {
        super.processControlEvent(control);
        switch (control) {
            case "FIRE":
                Adapter.socketSend("UPDATE_TANK_FIRE");
                break;
            default:
                break;
        }
    }

    sendSyncMessage(send, center) {
        if (center.x === send.x
            && center.y === send.y
            && center.orientation === send.orientation
            && center.action === send.action) {
            return;
        }
        send.x = center.x;
        send.y = center.y;
        send.orientation = center.orientation;
        send.action = center.action;
        Adapter.socketSend("UPDATE_TANK_CONTROL",
            {
                orientation: send.orientation,
                action: send.action,
                x: send.x,
                y: send.y
            });
    };
}