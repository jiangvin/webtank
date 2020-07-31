/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/28
 */

import Engine from "./engine.js";
import Common from "../tool/common.js";
import Resource from "../tool/resource.js";
import Status from "../tool/status.js";
import Button from "../stage/button.js";
import Connect from "../tool/connect.js";

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
                        Common.getRequest("/multiplePlayers/getRoomName?roomName=" + Resource.getUser().userId + "的房间",
                            function (roomName) {
                                //set room id
                                thisEngine.room.roomInfo.roomId = roomName;

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
        Common.getRequest("/multiplePlayers/getUserId?userId=" + Resource.getUser().originalUserId, function (userId) {
            Resource.setUserId(userId);
            callback();
        })
    }

    /**
     * 每两秒确认一次连接是否失效
     */
    addConnectCheckEvent() {
        const thisEngine = this;
        const callBack = function () {
            if (Connect.status() === true) {
                const start = new Date().getTime();
                Common.getRequest("/multiplePlayers/ping", function () {
                    Resource.getRoot().netDelay = new Date().getTime() - start;
                });
                thisEngine.addTimeEvent(120, callBack);
            } else {
                Status.setStatus(Status.statusPause(), "与服务器断开！");
                //再关闭一次，排除一些情况
                Connect.disconnect();
                //显示蒙版
                thisEngine.room.createItem({
                    z: 8,
                    draw: function (ctx) {
                        ctx.globalAlpha = 0.5;
                        ctx.fillStyle = '#000000';
                        ctx.fillRect(0, 0, Resource.width(), Resource.height());
                        ctx.globalAlpha = 1;
                    }
                });

                //显示返回按钮
                const back = new Button("返回主菜单", Resource.width() * 0.5, Resource.height() * 0.55, function () {
                    Resource.getRoot().lastStage();
                    Resource.getRoot().currentStage().initMenu();
                });
                thisEngine.room.addItem(back);
            }
        };

        console.log("connect status will be checked per 120 frames...");
        thisEngine.addTimeEvent(120, callBack);
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
        Connect.send("UPDATE_TANK_CONTROL",
            {
                orientation: send.orientation,
                action: send.action,
                x: send.x,
                y: send.y
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
        });
    }
}