import Stage from "./stage.js";
import Common from "../tool/common.js";
import Resource from "../tool/resource.js";
import ControlUnit from "../item/controlunit.js";
import RoomInfo from "../item/roominfo.js";

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
            callBack: function () {
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
            callBack: function () {
                Common.nextStage();
            }
        });
    }

    init() {
        this.loadRoomList();
    }

    loadRoomList() {
        const start = this.startRoomIndex;

        Common.getRequest("/multiplePlayers/getRooms?limit=6&start=" + start,
            /**
             *
             * @param data {{roomList,userCount,creator}}
             */
            data => {
                //remove all buttons
                for (let i = 0; i < 5; ++i) {
                    this.removeItemFromId("button_" + i);
                }
                const roomList = data.roomList;
                const interval = 114;

                //create buttons
                for (let i = 0; i < 5; ++i) {
                    if (!roomList[i]) {
                        break;
                    }
                    this.createItem({
                        id: "button_" + i,
                        draw: function (ctx) {
                            ctx.displayCenter("enter",
                                1668,
                                380 + i * interval,
                                170);
                        },
                        controlUnit: new ControlUnit(
                            "button_" + i,
                            {
                                x: 1583,
                                y: 348 + i * interval
                            },
                            {
                                x: 1753,
                                y: 412 + i * interval
                            },
                            function () {
                                const room = roomList[i];
                                const roomInfo = new RoomInfo(true);
                                roomInfo.roomId = room.roomId;
                                roomInfo.joinRoom = true;
                                Common.gotoStage("room", roomInfo);
                            }
                        )
                    })
                }

                //show room information
                this.createItem({
                    id: "room_list",
                    draw: function (ctx) {
                        const x = Resource.getOffset().x;
                        const y = 380 + Resource.getOffset().y;

                        ctx.font = '40px Helvetica';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = '#040141';

                        for (let i = 0; i < 5; ++i) {
                            if (!roomList[i]) {
                                break;
                            }
                            const room = roomList[i];

                            ctx.fillText(room.roomId, x + 280, y + i * interval);
                            ctx.fillText(room.roomType === "PVE" ? "闯关模式" : "对抗模式",
                                x + 525, y + i * interval);
                            ctx.fillText("游戏中", x + 790, y + i * interval);
                            ctx.fillText(room.userCount, x + 1026, y + i * interval);
                            ctx.fillText(room.creator, x + 1323, y + i * interval);
                        }
                    }
                });
            });
    }

    getId() {
        return "net_list";
    }
}