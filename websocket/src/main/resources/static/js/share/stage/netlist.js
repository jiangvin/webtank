import Stage from "./stage.js";
import Common from "../tool/common.js";
import ControlUnit from "../item/controlunit.js";
import RoomInfo from "../item/roominfo.js";
import TeamSelector from "../item/teamselector.js";

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/7
 */

export default class NetList extends Stage {
    constructor() {
        super();

        this.initStageItems();

        this.startRoomIndex = 0;

        this.nextLoadInterval = 200;
        this.isLoading = false;

        this.mainWindow = $("#main");
        this.input = null;
        this.search = null;
    }

    initStageItems() {
        this.createFullScreenItem("net_background");

        //back to menu
        this.createControl({
            leftTop: {
                x: 1784,
                y: 32
            },
            size: {
                w: 86,
                h: 96
            },
            callback: function () {
                Common.gotoStage("menu");
            }
        });

        //create room
        this.createControl({
            leftTop: {
                x: 1520,
                y: 920
            },
            size: {
                w: 255,
                h: 80
            },
            callback: function () {
                Common.nextStage();
            }
        });

        //search room
        this.createControl({
            leftTop: {
                x: 426,
                y: 938
            },
            size: {
                w: 60,
                h: 60
            },
            callback: () => {
                this.startRoomIndex = 0;
                this.search = this.input.val();
                this.loadRoomList();
            }
        })
    }

    init() {
        const input = $("<input/>");
        input.attr("type", "text");
        input.attr("placeholder", "输入房间号或ID");
        input.addClass("input-room-name");
        this.mainWindow.append(input);
        this.input = input;
        this.search = null;

        this.clear();
        this.loadRoomList();
    }

    destroy() {
        this.mainWindow.empty();
    }

    update() {
        super.update();
        this.updateAutoLoading();
    }

    updateAutoLoading() {
        if (this.isLoading) {
            return;
        }

        if (this.nextLoadInterval > 0) {
            --this.nextLoadInterval;
        } else {
            this.nextLoadInterval = 200;
            this.loadRoomList();
        }
    }

    clear() {
        //remove all buttons
        for (let i = 0; i < 5; ++i) {
            this.removeItemFromId("button_" + i);
        }
        this.removeItemFromId("room_list");
    }

    loadRoomList() {
        this.isLoading = true;
        const start = this.startRoomIndex;

        let url = "/multiplePlayers/getRooms?limit=6&start=" + start;
        if (this.search) {
            url += "&search=" + this.search;
        }
        Common.getRequest(url,
            /**
             *
             * @param data {{roomList,userCount,creator}}
             */
            data => {
                this.isLoading = false;
                this.clear();

                const roomList = data.roomList;
                const interval = 114;

                //create buttons
                for (let i = 0; i < 5; ++i) {
                    if (!roomList[i]) {
                        break;
                    }
                    this.createItem({
                        id: "button_" + i,
                        draw: ctx => {
                            ctx.displayCenter("enter",
                                1668,
                                380 + i * interval,
                                170);
                        },
                        controlUnit: new ControlUnit({
                            id: "button_" + i,
                            leftTop: {
                                x: 1583,
                                y: 348 + i * interval
                            },
                            rightBottom: {
                                x: 1753,
                                y: 412 + i * interval
                            },
                            callback: () => {
                                const room = roomList[i];
                                const roomInfo = new RoomInfo(true);
                                roomInfo.roomId = room.roomId;
                                roomInfo.roomType = room.roomType;
                                roomInfo.mapId = room.mapId;
                                roomInfo.subId = room.subId;
                                roomInfo.joinRoom = true;
                                if (room.roomType === "PVE") {
                                    //闯关模式
                                    Common.gotoStage("room", roomInfo);
                                } else {
                                    //对抗模式
                                    this.isLoading = true;
                                    new TeamSelector(
                                        this,
                                        (teamType) => {
                                            roomInfo.joinTeamType = teamType;
                                            Common.gotoStage("room", roomInfo);
                                        },
                                        () => {
                                            this.isLoading = false;
                                        });
                                }
                            }
                        })
                    })
                }

                //show room information
                this.createItem({
                    id: "room_list",
                    draw: function (ctx) {
                        const x = 0;
                        const y = 380;

                        ctx.fontSize = 40;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = '#040141';

                        for (let i = 0; i < 5; ++i) {
                            if (!roomList[i]) {
                                break;
                            }
                            const room = roomList[i];

                            ctx.displayText(room.roomId, x + 280, y + i * interval);
                            ctx.displayText(room.roomType === "PVE" ? "闯关模式" : "对抗模式",
                                x + 525, y + i * interval);
                            ctx.displayText("游戏中", x + 790, y + i * interval);
                            ctx.displayText(room.userCount, x + 1026, y + i * interval);
                            ctx.displayText(room.creator, x + 1323, y + i * interval);
                        }
                    }
                });
            });
    }

    getId() {
        return "net_list";
    }
}