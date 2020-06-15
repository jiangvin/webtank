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
import Connect from "../tool/connect.js";
import Rect from "./rect.js";
import Item from "./item.js";

export default class Menu extends Stage {
    constructor() {
        super();

        this.buttons = [];
        this.buttonIndex = 0;
        this.joinRoomCache = {};
        this.initButtons();

        //排行榜
        this.rankIndex = 6;
        this.rankInfos = [];
        this.rankStart = 0;

        //加入房间
        this.joinIndex = 4;
        this.joinInfos = [];

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
                roomId: "单人模式",
                joinTeamType: "RED"
            };
            thisMenu.initRoom(roomInfo);
            Resource.getRoot().addEngine(false);
        });
        const bt0102 = new Button("多人游戏", Resource.width() * 0.5, Resource.height() * 0.35 + 100, function () {
            thisMenu.switchButtons(1);
        });
        const bt0103 = new Button("排行榜", Resource.width() * 0.5, Resource.height() * 0.35 + 200, function () {
            thisMenu.switchButtons(6);
            thisMenu.rankStart = 0;
            thisMenu.loadRanks();
        });
        this.buttons[0] = [bt0101, bt0102, bt0103];

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
        this.buttons[1] = [bt0201, bt0202, bt0203];

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
        this.buttons[2] = [bt0301, bt0302, bt0303];

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
        this.buttons[3] = [bt0401, bt0402, bt0403];

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
            thisMenu.joinRoomEvent();
        });
        this.buttons[5] = [bt0601, bt0602, bt0603];

        //排行榜
        const rect0701 = new Rect(Resource.width() / 2, Resource.height() * .57, Resource.width() * .6, Resource.height() * .65);
        thisMenu.rankRect = rect0701;
        const bt0701 = new Button("上一页",
            rect0701.x - 120,
            rect0701.y + rect0701.height / 2 - 35,
            function () {
                if (thisMenu.rankStart > 0) {
                    thisMenu.rankStart -= 10;
                    thisMenu.loadRanks();
                }
            }, 110, 50, '24px Arial');
        const bt0702 = new Button("下一页",
            rect0701.x,
            rect0701.y + rect0701.height / 2 - 35,
            function () {
                thisMenu.rankStart += 10;
                thisMenu.loadRanks();
            }, 110, 50, '24px Arial');
        const bt0703 = new Button("返回",
            rect0701.x + 120,
            rect0701.y + rect0701.height / 2 - 35,
            function () {
                thisMenu.switchButtons(-6);
            }, 110, 50, '24px Arial');
        const header = new Item({
            draw: function (ctx) {
                ctx.font = '20px Helvetica';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillStyle = '#FFF';
                ctx.fillText("排名                 玩家                 分数           模式",
                    rect0701.x,
                    rect0701.y - rect0701.height / 2 + 33);
            }
        });
        this.buttons[6] = [rect0701, bt0701, bt0702, bt0703, header];
    }

    loadRanks() {
        const thisMenu = this;
        Common.getRequest("/user/getRankList?limit=10&start=" + this.rankStart,
            /**
             *
             * @param dataList {{score,username,gameType}}
             */
            function (dataList) {
                if (thisMenu.buttonIndex !== thisMenu.rankIndex) {
                    return;
                }

                thisMenu.removeRankInfos();
                const x = thisMenu.rankRect.x;
                const y = thisMenu.rankRect.y - thisMenu.rankRect.height / 2 + 58;
                for (let i = 0; i < 10; ++i) {
                    const rankNumber = new Item({
                        draw: function (ctx) {
                            thisMenu.drawRankText(
                                ctx,
                                thisMenu.rankStart + 1 + i + "",
                                x - 184,
                                y + i * 22);
                        }
                    });
                    thisMenu.rankInfos[thisMenu.rankInfos.length] = rankNumber;
                    thisMenu.addItem(rankNumber);

                    if (!dataList[i]) {
                        continue;
                    }
                    const data = dataList[i];

                    //名字
                    const name = new Item({
                        draw: function (ctx) {
                            thisMenu.drawRankText(ctx, data.username, x - 47, y + i * 22);
                        }
                    });
                    thisMenu.rankInfos[thisMenu.rankInfos.length] = name;
                    thisMenu.addItem(name);

                    //分数
                    const score = new Item({
                        draw: function (ctx) {
                            thisMenu.drawRankText(ctx, data.score, x + 83, y + i * 22);
                        }
                    });
                    thisMenu.rankInfos[thisMenu.rankInfos.length] = score;
                    thisMenu.addItem(score);

                    //模式
                    const mode = new Item({
                        draw: function (ctx) {
                            thisMenu.drawRankText(
                                ctx,
                                data.gameType === 0 ? "单人" : "联机",
                                x + 186,
                                y + i * 22);
                        }
                    });
                    thisMenu.rankInfos[thisMenu.rankInfos.length] = mode;
                    thisMenu.addItem(mode);
                }
            })
    }

    drawRankText(ctx, text, x, y) {
        ctx.font = '20px Helvetica';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = '#FFF';
        ctx.fillText(text, x, y);
    }

    removeRankInfos() {
        const thisMenu = this;
        thisMenu.rankInfos.forEach(function (info) {
            thisMenu.removeItem(info);
        });
        thisMenu.rankInfos = [];
    }

    loadButtons() {
        const buttons = this.buttons[this.buttonIndex];
        for (let i = 0; i < buttons.length; ++i) {
            this.addItem(buttons[i]);
        }
    }

    removeButtons() {
        const buttons = this.buttons[this.buttonIndex];
        for (let i = 0; i < buttons.length; ++i) {
            this.removeItem(buttons[i]);
        }

        //排行榜特殊处理
        if (this.buttonIndex === this.rankIndex) {
            this.removeRankInfos();
        }

        //加入房间特殊处理
        if (this.buttonIndex === this.joinIndex) {
            const input = document.getElementById("input-room-name");
            input.parentNode.removeChild(input);
            const thisMenu = this;
            this.joinInfos.forEach(function (joinItem) {
                thisMenu.removeItem(joinItem);
            });
            this.joinInfos = [];
        }
    }

    switchButtons(offset) {
        this.removeButtons();
        this.buttonIndex += offset;
        this.loadButtons();
    }

    switchToIndex(index) {
        this.removeButtons();
        this.buttonIndex = index;
        this.loadButtons();
    }

    initMenu() {
        Connect.disconnect();
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

        let start = 0;
        const background = new Rect(Resource.width() / 2, Resource.height() / 2, Resource.width() * .6, Resource.height() * .8);
        buttons[buttons.length] = background;
        buttons[buttons.length] = new Button("上一页",
            background.x - 120,
            background.y + background.height / 2 - 35,
            function () {
                if (start > 0) {
                    start -= 3;
                    search();
                }
            }, 110, 50, '24px Arial');
        buttons[buttons.length] = new Button("下一页",
            background.x,
            background.y + background.height / 2 - 35,
            function () {
            if (thisMenu.joinInfos.length > 2) {
                start += 3;
                search();
            }
            }, 110, 50, '24px Arial');
        buttons[buttons.length] = new Button("返回",
            background.x + 120,
            background.y + background.height / 2 - 35,
            function () {
                thisMenu.switchButtons(-3);
            }, 110, 50, '24px Arial');

        buttons[buttons.length] = new Button("搜索",
            background.x + 120,
            background.y - background.height / 2 + 35,
            function () {
                start = 0;
                search();
            }, 110, 50, '24px Arial');

        //TODO - wx特殊处理输入框
        let input = document.createElement('input');
        input.type = "text";
        input.id = "input-room-name";
        input.placeholder = "请输入房间名";
        input.className = "input-room-name";
        input.style.left = (background.x - 175) + "px";
        input.style.top = (background.y - background.height / 2 + 11) + "px";
        document.getElementById('wrapper').appendChild(input);
        thisMenu.switchToIndex(4);

        const search = function () {
            let queryString = "?limit=3&start=" + start;
            const roomName = $('#input-room-name').val();
            if (roomName !== "") {
                queryString += "&search=" + roomName;
            }
            /**
             * @param dto {{roomList}}
             */
            Common.getRequest("/multiplePlayers/getRooms" + queryString, function (dto) {
                thisMenu.joinInfos.forEach(function (joinItem) {
                    thisMenu.removeItem(joinItem);
                });
                thisMenu.joinInfos = [];
                let offsetY = 0;

                dto.roomList.forEach(function (room) {
                    const title = room.roomId + " [关卡:" + room.mapId + "]";
                    const type = room.roomType === "PVE" ? "闯关" : "对战";
                    const roomButton = new RoomButton(title, type, Resource.width() * 0.5, Resource.height() * 0.33 + offsetY, function () {
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
                    }, 350, 72);
                    thisMenu.joinInfos[thisMenu.joinInfos.length] = roomButton;
                    thisMenu.addItem(roomButton);
                    offsetY += 80;
                });
            })
        };
        search();
    }
}