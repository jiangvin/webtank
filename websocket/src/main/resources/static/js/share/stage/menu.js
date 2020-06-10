/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/26
 */

import Stage from "./stage.js";
import Resource from "../tool/resource.js";
import Button from "./button.js"
import RoomButton from "./roombutton.js";
import Common from "../tool/common.js";
import Adapter from "../tool/adapter.js";

export default class Menu extends Stage {
    constructor() {
        super();

        this.buttons = [];
        this.buttonIndex = 0;
        this.joinRoomCache = {};
        this.initButtons();

        //背景
        const bgImage = Resource.getImage("background_menu");
        this.createItem({
            draw: function (ctx) {
                ctx.drawImage(bgImage,
                    0, 0,
                    bgImage.width, bgImage.height,
                    0, 0,
                    Resource.width(), Resource.height());
            }
        });

        //标题
        this.createItem({
            draw: function (context) {
                context.font = 'bold 55px Helvetica';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillStyle = '#FFF';
                context.fillText('90坦克世界', Resource.width() / 2, Resource.height() * .12);
            }
        });

        //名字
        this.createItem({
            draw: function (ctx) {
                ctx.font = '30px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fff';
                ctx.fillText(Resource.getUser().userId,
                    Resource.width() / 2,
                    Resource.height() * .2);
            }
        });

        this.loadButtons();
    }

    initRoom(roomInfo) {
        Common.nextStage();
        Resource.getRoot().currentStage().init(roomInfo);
    }

    initButtons() {
        const thisMenu = this;

        //主菜单
        const bt0101 = new Button("单人游戏", Resource.width() * 0.5, Resource.height() * 0.35, function () {
            const roomInfo = {
                mapId: 1,
                roomType: "PVE",
                roomId: Resource.getUser().userId + "的房间",
                joinTeamType: "RED"
            };
            thisMenu.initRoom(roomInfo);
            Resource.getRoot().addEngine(false);
        });
        const bt0102 = new Button("多人游戏", Resource.width() * 0.5, Resource.height() * 0.35 + 100, function () {
            thisMenu.switchButtons(1);
        });
        this.buttons[0] = [bt0101,bt0102];

        //多人游戏
        const bt0201 = new Button("创建房间", Resource.width() * 0.5, Resource.height() * 0.35, function () {
            thisMenu.switchButtons(1);
        });
        const bt0202 = new Button("加入房间", Resource.width() * 0.5, Resource.height() * 0.35 + 100, function () {
            thisMenu.joinRoomEvent();
        });
        const bt0203 = new Button("返回", Resource.width() * 0.5, Resource.height() * 0.35 + 200, function () {
            thisMenu.switchButtons(-1);
        });
        this.buttons[1] = [bt0201,bt0202,bt0203];

        //创建房间
        const bt0301 = new Button("闯关模式", Resource.width() * 0.5, Resource.height() * 0.35, function () {
            const roomInfo = {
                mapId: 1,
                roomType: "PVE",
                joinTeamType: "RED"
            };
            thisMenu.initRoom(roomInfo);
            Resource.getRoot().addEngine(true);
        });
        const bt0302 = new Button("对战模式", Resource.width() * 0.5, Resource.height() * 0.35 + 100, function () {
            thisMenu.switchButtons(1);
        });
        const bt0303 = new Button("返回", Resource.width() * 0.5, Resource.height() * 0.35 + 200, function () {
            thisMenu.switchButtons(-1);
        });
        this.buttons[2] = [bt0301,bt0302,bt0303];

        //对战模式
        const bt0401 = new Button("红队", Resource.width() * 0.5, Resource.height() * 0.35, function () {
            const roomInfo = {
                mapId: 1,
                roomType: "PVP",
                joinTeamType: "RED",
                showTeam: true
            };
            thisMenu.initRoom(roomInfo);
            Resource.getRoot().addEngine(true);
        });
        const bt0402 = new Button("蓝队", Resource.width() * 0.5, Resource.height() * 0.35 + 100, function () {
            const roomInfo = {
                mapId: 1,
                roomType: "PVP",
                joinTeamType: "BLUE",
                showTeam: true
            };
            thisMenu.initRoom(roomInfo);
            Resource.getRoot().addEngine(true);
        });
        const bt0403 = new Button("返回", Resource.width() * 0.5, Resource.height() * 0.35 + 200, function () {
            thisMenu.switchButtons(-1);
        });
        this.buttons[3] = [bt0401,bt0402,bt0403];

        //加入对战房间
        //对战模式
        const bt0601 = new Button("红队", Resource.width() * 0.5, Resource.height() * 0.35, function () {
            thisMenu.joinRoomCache.joinTeamType = "RED";
            thisMenu.initRoom(thisMenu.joinRoomCache);
            Resource.getRoot().addEngine(true);
        });
        const bt0602 = new Button("蓝队", Resource.width() * 0.5, Resource.height() * 0.35 + 100, function () {
            thisMenu.joinRoomCache.joinTeamType = "BLUE";
            thisMenu.initRoom(thisMenu.joinRoomCache);
            Resource.getRoot().addEngine(true);
        });
        const bt0603 = new Button("返回", Resource.width() * 0.5, Resource.height() * 0.35 + 200, function () {
            thisMenu.switchButtons(-1);
        });
        this.buttons[5] = [bt0601,bt0602,bt0603];
    }

    loadButtons() {
        const buttons = this.buttons[this.buttonIndex];
        for(let i = 0; i < buttons.length; ++i) {
            this.addButton(buttons[i]);
        }
    }

    removeButtons() {
        const buttons = this.buttons[this.buttonIndex];
        for(let i = 0; i < buttons.length; ++i) {
            this.removeButton(buttons[i]);
        }
    }

    switchButtons(offset) {
        this.removeButtons();
        this.buttonIndex += offset;
        this.loadButtons();
    }

    initMenu() {
        Adapter.stopConnect();
        Resource.getRoot().users = null;
        Resource.getRoot().netDelay = 0;
        this.removeButtons();
        this.buttonIndex = 0;
        this.loadButtons();
    }

    joinRoomEvent() {
        const thisMenu = this;
        thisMenu.buttons[4] = [];
        const buttons = thisMenu.buttons[4];
        let offsetY = 0;
        /**
         * @param dto {{roomList}}
         */
        Common.getRequest("/multiplePlayers/getRooms?start=0&limit=2", function (dto) {
            dto.roomList.forEach(function (room) {
                const title = "房间名:" + room.roomId + "[关卡:" + room.mapId + "]";
                const type = room.roomType === "PVE" ? "闯关" : "对战";
                buttons[buttons.length] = new RoomButton(title, type, Resource.width() * 0.5, Resource.height() * 0.35 + offsetY, function () {
                    if (room.roomType === "PVE") {
                        const roomInfo = {
                            mapId: room.mapId,
                            roomType: room.roomType,
                            roomId: room.roomId,
                            joinTeamType: "RED",
                            joinRoom: true
                        };
                        thisMenu.initRoom(roomInfo);
                        Resource.getRoot().addEngine(true);
                    } else {
                        thisMenu.joinRoomCache = {
                            mapId: room.mapId,
                            roomType: room.roomType,
                            roomId: room.roomId,
                            joinRoom: true,
                            showTeam: true
                        };
                        thisMenu.switchButtons(1);
                    }
                });
                offsetY += 100;
            });
            buttons[buttons.length] = new Button("返回", Resource.width() * 0.5, Resource.height() * 0.35 + offsetY, function () {
                thisMenu.switchButtons(-3);
            });
            thisMenu.switchButtons(3);
        })
    }
}