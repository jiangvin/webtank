/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/28
 */

import Engine from "./engine.js";
import Common from "../tool/common.js";
import Resource from "../tool/resource.js";
import Status from "../tool/status.js";
import Connect from "../tool/connect.js";
import ConnectStatus from "../tool/ConnectStatus.js";

export default class NetEngine extends Engine {
    constructor(room) {
        super(room);
        const thisEngine = this;

        thisEngine.setUserId(function () {
            Connect.connect(function () {

                //注册延时事件
                Common.addTimeEvent("CLIENT_READY", function () {
                    Connect.send("CLIENT_READY", {
                        username: Resource.getUser().username
                    })
                }, 30);

                //create room
                if (!room.roomInfo.joinRoom) {
                    Common.addTimeEvent("CREATE_ROOM", function () {
                        Common.getRequest("/multiplePlayers/getRoomId",
                            function (roomId) {
                                thisEngine.room.roomInfo.roomId = roomId;
                                Connect.send("CREATE_ROOM", thisEngine.room.roomInfo);
                            });
                    }, 40);
                } else {
                    //join room
                    Common.addTimeEvent("JOIN_ROOM", function () {
                        Connect.send("JOIN_ROOM", {
                            "roomId": thisEngine.room.roomInfo.roomId,
                            "joinTeamType": thisEngine.room.roomInfo.joinTeamType
                        })
                    }, 40);
                }

                //注册消息事件
                Common.addMessageEvent("GAME_STATUS", function () {
                    new ConnectStatus(thisEngine);
                })
            })
        })
    }

    setUserId(callback) {
        Common.getRequest("/multiplePlayers/getConnectName?name=" + Resource.getUser().originalUserId,
            function (connectName) {
                Resource.setUserId(connectName);
                callback();
            })
    }

    processControlEvent(control) {
        super.processControlEvent(control);
        switch (control) {
            case "FIRE":
                Connect.send("UPDATE_TANK_FIRE");
                break;
            default:
                break;
        }
    }

    sendSyncMessage(center) {
        Connect.send("UPDATE_TANK_CONTROL",
            {
                orientation: center.orientation,
                action: center.action,
                x: center.x,
                y: center.y
            });
    };

    again() {
        //需在暂停的时候触发
        if (Status.isGaming()) {
            return;
        }

        Common.postEncrypt("/shop/buyWithCoin", {
            userId: Resource.getUser().deviceId,
            buyType: "AGAIN_FOR_NET"
        }, function (data) {
            Resource.setUser(data);
        });
    }
}