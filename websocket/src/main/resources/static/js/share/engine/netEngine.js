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
import ControlUnit from "../item/controlunit.js";

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
                    thisEngine.addConnectCheckEvent();
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

    /**
     * 每两秒确认一次连接是否失效
     */
    addConnectCheckEvent() {
        const thisEngine = this;
        const callback = function () {
            if (Connect.status() === true) {
                const start = new Date().getTime();
                Common.getRequest("/multiplePlayers/ping", function () {
                    Resource.getRoot().netDelay = new Date().getTime() - start;
                });
                thisEngine.addTimeEvent(120, callback);
            } else {
                Status.setStatus(Status.statusPause());
                //再关闭一次，排除一些情况
                Connect.disconnect();
                //显示蒙版和文字
                thisEngine.room.createItem({
                    draw: function (ctx) {
                        ctx.globalAlpha = 0.5;
                        ctx.fillStyle = '#000000';
                        ctx.fillRect(0, 0, Resource.width(), Resource.height());
                        ctx.globalAlpha = 1;

                        ctx.font = (100 * Resource.getScale()) + 'px gameFont';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = '#FFF';
                        ctx.fillText("与服务器连接断开", Resource.width() / 2, Resource.height() * .4);
                    }
                });

                //显示返回按钮
                thisEngine.room.createItem({
                    draw: function (ctx) {
                        ctx.displayCenter("button_home",
                            960, 620,
                            350, 120, 0, true);
                    },
                    controlUnit: new ControlUnit({
                        center: {
                            x: 960,
                            y: 620
                        },
                        size: {
                            w: 350,
                            h: 120
                        },
                        callback: () => {
                            Resource.getRoot().gotoStage("menu");
                        },
                        needOffset: true
                    })
                });
            }
        };

        console.log("connect status will be checked per 120 frames...");
        thisEngine.addTimeEvent(120, callback);
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