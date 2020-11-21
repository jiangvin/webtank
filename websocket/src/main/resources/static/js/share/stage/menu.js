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
import Item from "../item/item.js";
import Adapter from "../tool/adapter.js";
import Sound from "../tool/sound.js";
import Shop from "./shop.js";
import ControlUnit from "./controlunit.js";

export default class Menu extends Stage {
    constructor() {
        super();

        const thisMenu = this;
        //背景
        const bgImage = Resource.getImage("menu");
        this.createItem({
            draw: function (ctx) {
                ctx.drawImage(bgImage,
                    0, 0,
                    bgImage.width, bgImage.height,
                    0, 0,
                    Resource.width(), Resource.height());
            }
        });

        //信息
        this.createItem({
            draw: function (ctx) {
                ctx.font = 'bold 13px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#FFF';

                //姓名
                ctx.fillText(Resource.getUser().userId, Resource.width() * .18, Resource.height() * .068);
                //金币
                ctx.fillText(Resource.getUser().coin, Resource.width() * .39, Resource.height() * .068);
                //排名
                ctx.fillText(Resource.getUser().rank, Resource.width() * .62, Resource.height() * .068);
                //积分
                ctx.fillText(Resource.getUser().score, Resource.width() * .84, Resource.height() * .068);
            }
        });

        //排行榜打开按钮
        const buttonOpenRankBoard = new ControlUnit(
            Resource.generateClientId(),
            {x: Resource.width() * .09, y: Resource.height() * .69},
            {x: Resource.width() * .196, y: Resource.height() * .96},
            function () {
                Common.nextStage();
            });
        this.controlUnits.set(buttonOpenRankBoard.id, buttonOpenRankBoard);

        // //加载主页面事件
        // this.mainCotrol = new Map();
        // this.mainCotrol.set(buttonOpenRankBoard.id, buttonOpenRankBoard);
        // this.controlUnits = this.mainCotrol;
        // //加载排行榜事件
        // this.rankBoardCotrol = new Map();
        // this.rankBoardCotrol.set(buttonCloseRankBoard.id, buttonCloseRankBoard);


        // this.buttons = [];
        // this.buttonIndex = 0;
        // this.roomCache = {};
        //
        // //排行榜
        // this.rankIndex = 6;
        // this.rankInfos = [];
        // this.rankStart = 0;
        //
        // //加入房间
        // this.joinIndex = 4;
        // this.joinInfos = [];
        //
        // //商店
        // this.shop = new Shop(this);
        // this.shopIndex = 7;
        //
        // this.initButtons();
        //
        // //标题
        // this.createItem({
        //     draw: function (context) {
        //         context.font = 'bold 55px Helvetica';
        //         context.textAlign = 'center';
        //         context.textBaseline = 'middle';
        //         context.fillStyle = '#FFF';
        //         context.fillText('坦克战地', Resource.width() / 2, Resource.height() * .12);
        //     }
        // });
        //
        // //名字
        // this.createItem({
        //     draw: function (ctx) {
        //         ctx.font = '30px Arial';
        //         ctx.textAlign = 'center';
        //         ctx.textBaseline = 'middle';
        //         ctx.fillStyle = '#fff';
        //         let text = Resource.getUser().userId;
        //         if (Resource.getUser().rank) {
        //             text += "(排名:" + Resource.getUser().rank + ")";
        //         }
        //         ctx.fillText(text, Resource.width() / 2, Resource.height() * .2);
        //     }
        // });

        // this.loadButtons();
    }

    // openRankBoard() {
    //     this.createItem({
    //         id: "rank_board",
    //         draw: function (ctx) {
    //             //遮罩
    //             ctx.globalAlpha = 0.5;
    //             ctx.fillStyle = "#000";
    //             ctx.fillRect(0, 0, Resource.width(), Resource.height());
    //             ctx.globalAlpha = 1;
    //
    //             ctx.drawResourceCenter("rank_board",
    //                 Resource.width() / 2,
    //                 Resource.height() / 2,
    //                 Resource.width(),
    //                 Resource.height());
    //         }
    //     });
    //     this.controlUnits = this.rankBoardCotrol;
    // }
    //
    // closeRankBoard() {
    //     this.items.delete("rank_board");
    //     this.controlUnits = this.mainCotrol;
    // }

    // init() {
    // Adapter.initInput();
    // Adapter.instance.inputEnable = false;
    // }

    // initRoom(roomInfo) {
    //     Common.nextStage(roomInfo);
    // }
    //
    // getButtonPos(line) {
    //     return Resource.height() * 0.32 + line * 85;
    // }
    //
    // initButtons() {
    //     const thisMenu = this;
    //
    //     //主菜单
    //     const bt0101 = new Button("单人游戏", Resource.width() * 0.5, this.getButtonPos(0), function () {
    //         thisMenu.initStagePve(false);
    //     });
    //     const bt0102 = new Button("多人游戏", Resource.width() * 0.5, this.getButtonPos(1), function () {
    //         thisMenu.switchButtons(1);
    //     });
    //     const bt0103 = new Button("道具商店", Resource.width() * 0.5, this.getButtonPos(2), function () {
    //         thisMenu.switchButtons(7);
    //         thisMenu.shop.loadShopItems();
    //     });
    //     const bt0104 = new Button("排行榜", Resource.width() * 0.5, this.getButtonPos(3), function () {
    //         thisMenu.switchButtons(6);
    //         thisMenu.rankStart = 0;
    //         thisMenu.loadRanks();
    //     });
    //     this.buttons[0] = [bt0101, bt0102, bt0103, bt0104];
    //
    //     //多人游戏
    //     const bt0201 = new Button("创建房间", Resource.width() * 0.5, this.getButtonPos(0), function () {
    //         thisMenu.switchButtons(1);
    //     });
    //     const bt0202 = new Button("加入房间", Resource.width() * 0.5, this.getButtonPos(1), function () {
    //         thisMenu.joinRoomEvent();
    //     });
    //     const bt0203 = new Button("返回", Resource.width() * 0.5, this.getButtonPos(2), function () {
    //         thisMenu.switchButtons(-1);
    //     });
    //     this.buttons[1] = [bt0201, bt0202, bt0203];
    //
    //     //创建房间
    //     const bt0301 = new Button("闯关模式", Resource.width() * 0.5, this.getButtonPos(0), function () {
    //         thisMenu.initStagePve(true);
    //     });
    //     const bt0302 = new Button("对战模式", Resource.width() * 0.5, this.getButtonPos(1), function () {
    //         thisMenu.switchButtons(1);
    //     });
    //     const bt0303 = new Button("返回", Resource.width() * 0.5, this.getButtonPos(2), function () {
    //         thisMenu.switchButtons(-1);
    //     });
    //     this.buttons[2] = [bt0301, bt0302, bt0303];
    //
    //     //对战模式
    //     const bt0401 = new Button("红队", Resource.width() * 0.5, this.getButtonPos(0), function () {
    //         const roomInfo = {
    //             roomType: "PVP",
    //             joinTeamType: "RED",
    //             showTeam: true
    //         };
    //         thisMenu.initRoom(roomInfo);
    //         Resource.getRoot().addEngine(true);
    //     });
    //     const bt0402 = new Button("蓝队", Resource.width() * 0.5, this.getButtonPos(1), function () {
    //         const roomInfo = {
    //             roomType: "PVP",
    //             joinTeamType: "BLUE",
    //             showTeam: true
    //         };
    //         thisMenu.initRoom(roomInfo);
    //         Resource.getRoot().addEngine(true);
    //     });
    //     const bt0403 = new Button("返回", Resource.width() * 0.5, this.getButtonPos(2), function () {
    //         thisMenu.switchButtons(-1);
    //     });
    //     this.buttons[3] = [bt0401, bt0402, bt0403];
    //
    //     //加入对战房间
    //     //对战模式
    //     const bt0601 = new Button("红队", Resource.width() * 0.5, this.getButtonPos(0), function () {
    //         thisMenu.roomCache.joinTeamType = "RED";
    //         thisMenu.initRoom(thisMenu.roomCache);
    //         Resource.getRoot().addEngine(true);
    //     });
    //     const bt0602 = new Button("蓝队", Resource.width() * 0.5, this.getButtonPos(1), function () {
    //         thisMenu.roomCache.joinTeamType = "BLUE";
    //         thisMenu.initRoom(thisMenu.roomCache);
    //         Resource.getRoot().addEngine(true);
    //     });
    //     const bt0603 = new Button("返回", Resource.width() * 0.5, this.getButtonPos(2), function () {
    //         thisMenu.joinRoomEvent();
    //     });
    //     this.buttons[5] = [bt0601, bt0602, bt0603];
    //
    //
    //     this.buttons[7] = this.shop.initShop();
    //
    //     //this.buttons[8]为关卡选择
    //
    //     //this.buttons[9]为难度选择
    // }
    //
    // initStagePve(isNet) {
    //     this.buttons[8] = [];
    //     const list = this.buttons[8];
    //     const thisMenu = this;
    //
    //     list[list.length] = new Button("关卡 01", Resource.width() * 0.5, this.getButtonPos(0), function () {
    //        thisMenu.roomCache = {
    //             mapId: 1,
    //             subId: 1,
    //             roomType: "PVE",
    //             roomId: isNet === true ? "多人模式" : "单人模式",
    //             joinTeamType: "RED"
    //         };
    //        thisMenu.initStagePveMode(isNet);
    //     });
    //
    //     list[list.length] = new Button("关卡 02", Resource.width() * 0.5, this.getButtonPos(1), function () {
    //         if (Resource.getUser().stage < 1) {
    //             Common.addMessage("未解锁, 请先通关之前的关卡!", "#FF0");
    //             return;
    //         }
    //         thisMenu.roomCache = {
    //             mapId: 2,
    //             subId: 1,
    //             roomType: "PVE",
    //             roomId: isNet === true ? "多人模式" : "单人模式",
    //             joinTeamType: "RED"
    //         };
    //         thisMenu.initStagePveMode(isNet);
    //     });
    //     if (Resource.getUser().stage < 1) {
    //         list[list.length - 1].image = Resource.getOrCreateImage("button_disabled");
    //     }
    //
    //     list[list.length] = new Button("关卡 03", Resource.width() * 0.5, this.getButtonPos(2), function () {
    //         if (Resource.getUser().stage < 2) {
    //             Common.addMessage("未解锁, 请先通关之前的关卡!", "#FF0");
    //             return;
    //         }
    //
    //         //TODO STAGE 03
    //         Common.addMessage("暂未开放，敬请期待!");
    //     });
    //     if (Resource.getUser().stage < 2) {
    //         list[list.length - 1].image = Resource.getOrCreateImage("button_disabled");
    //     }
    //
    //     list[list.length] = new Button("返回", Resource.width() * 0.5, this.getButtonPos(3), function () {
    //         if (isNet) {
    //             thisMenu.switchToIndex(2);
    //         } else {
    //             thisMenu.switchToIndex(0);
    //         }
    //     });
    //
    //     thisMenu.switchToIndex(8);
    // }
    //
    // initStagePveMode(isNet) {
    //     this.buttons[9] = [];
    //     const list = this.buttons[9];
    //     const thisMenu = this;
    //
    //     list[list.length] = new Button("简单", Resource.width() * 0.5, this.getButtonPos(0), function () {
    //         thisMenu.initRoom(thisMenu.roomCache);
    //         Resource.getRoot().addEngine(isNet);
    //     });
    //
    //     list[list.length] = new Button("困难", Resource.width() * 0.5, this.getButtonPos(1), function () {
    //         thisMenu.roomCache.hardMode = true;
    //         thisMenu.initRoom(thisMenu.roomCache);
    //         Resource.getRoot().addEngine(isNet);
    //     });
    //
    //     list[list.length] = new Button("返回", Resource.width() * 0.5, this.getButtonPos(2), function () {
    //         thisMenu.initStagePve(isNet);
    //     });
    //
    //     thisMenu.switchToIndex(9);
    // }
    //
    //
    // loadButtons() {
    //     const buttons = this.buttons[this.buttonIndex];
    //     for (let i = 0; i < buttons.length; ++i) {
    //         this.addItem(buttons[i]);
    //     }
    // }
    //
    // removeButtons() {
    //     const buttons = this.buttons[this.buttonIndex];
    //     for (let i = 0; i < buttons.length; ++i) {
    //         this.removeItem(buttons[i]);
    //     }
    //
    //     //排行榜特殊处理
    //     if (this.buttonIndex === this.rankIndex) {
    //         this.removeRankInfos();
    //     }
    //
    //     //加入房间特殊处理
    //     if (this.buttonIndex === this.joinIndex) {
    //         this.removeInput();
    //         const thisMenu = this;
    //         this.joinInfos.forEach(function (joinItem) {
    //             thisMenu.removeItem(joinItem);
    //         });
    //         this.joinInfos = [];
    //     }
    //
    //     if (this.buttonIndex === this.shopIndex) {
    //         this.shop.removeCurrentItems();
    //     }
    // }
    //
    // removeInput() {
    //     const input = document.getElementById("input-room-name");
    //     if (input) {
    //         input.parentNode.removeChild(input);
    //     }
    // }
    //
    // switchButtons(offset) {
    //     this.removeButtons();
    //     this.buttonIndex += offset;
    //     this.loadButtons();
    // }
    //
    // switchToIndex(index) {
    //     this.removeButtons();
    //     this.buttonIndex = index;
    //     this.loadButtons();
    // }
    //
    // initMenu() {
    //     //同步用户信息(获得的金币等)
    //     Common.syncUserData();
    //
    //     Connect.disconnect();
    //     Sound.stopAll();
    //     Resource.getRoot().engine = null;
    //     Resource.getRoot().users = null;
    //     Resource.getRoot().netDelay = 0;
    //     this.removeButtons();
    //     this.buttonIndex = 0;
    //     this.loadButtons();
    // }
    //
    // joinRoomEvent() {
    //     const thisMenu = this;
    //     thisMenu.buttons[4] = [];
    //     const buttons = thisMenu.buttons[4];
    //
    //     let start = 0;
    //     const background = new Rect(Resource.width() / 2, Resource.height() / 2, Resource.width() * .6, Resource.height() * .8);
    //     buttons[buttons.length] = background;
    //     buttons[buttons.length] = new Button("上一页",
    //         background.x - 120,
    //         background.y + background.height / 2 - 35,
    //         function () {
    //             if (start > 0) {
    //                 start -= 3;
    //                 search();
    //             }
    //         }, 110, 50, '24px Arial');
    //     buttons[buttons.length] = new Button("下一页",
    //         background.x,
    //         background.y + background.height / 2 - 35,
    //         function () {
    //             if (thisMenu.joinInfos.length > 2) {
    //                 start += 3;
    //                 search();
    //             }
    //         }, 110, 50, '24px Arial');
    //     buttons[buttons.length] = new Button("返回",
    //         background.x + 120,
    //         background.y + background.height / 2 - 35,
    //         function () {
    //             thisMenu.switchButtons(-3);
    //         }, 110, 50, '24px Arial');
    //
    //     buttons[buttons.length] = new Button("搜索",
    //         background.x + 120,
    //         background.y - background.height / 2 + 35,
    //         function () {
    //             start = 0;
    //             search();
    //         }, 110, 50, '24px Arial');
    //
    //     Adapter.createInputRoomName(
    //         background.x - 175,
    //         background.y - background.height / 2 + 11,
    //         buttons);
    //
    //     thisMenu.switchToIndex(4);
    //     const search = function () {
    //         let queryString = "?limit=3&start=" + start;
    //         const roomName = Adapter.getInputRoomName(thisMenu.items);
    //         if (roomName !== "") {
    //             queryString += "&search=" + roomName;
    //         }
    //         /**
    //          * @param dto {{roomList}}
    //          */
    //         Common.getRequest("/multiplePlayers/getRooms" + queryString, function (dto) {
    //             thisMenu.joinInfos.forEach(function (joinItem) {
    //                 thisMenu.removeItem(joinItem);
    //             });
    //             thisMenu.joinInfos = [];
    //             let offsetY = 0;
    //
    //             dto.roomList.forEach(function (room) {
    //                 const title = room.roomId + " [关卡:" + room.mapId + "-" + room.subId + "]";
    //                 const type = room.roomType === "PVE" ? "闯关" : "对战";
    //                 const roomButton = new RoomButton(title, type, Resource.width() * 0.5, Resource.height() * 0.33 + offsetY, function () {
    //                     if (room.roomType === "PVE") {
    //                         const roomInfo = {
    //                             mapId: room.mapId,
    //                             subId: room.subId,
    //                             roomType: room.roomType,
    //                             roomId: room.roomId,
    //                             joinTeamType: "RED",
    //                             joinRoom: true
    //                         };
    //                         thisMenu.removeInput();
    //                         thisMenu.initRoom(roomInfo);
    //                         Resource.getRoot().addEngine(true);
    //                     } else {
    //                         thisMenu.roomCache = {
    //                             mapId: room.mapId,
    //                             subId: room.subId,
    //                             roomType: room.roomType,
    //                             roomId: room.roomId,
    //                             joinRoom: true,
    //                             showTeam: true
    //                         };
    //                         thisMenu.switchButtons(1);
    //                     }
    //                 }, 350, 72);
    //                 thisMenu.joinInfos[thisMenu.joinInfos.length] = roomButton;
    //                 thisMenu.addItem(roomButton);
    //                 offsetY += 80;
    //             });
    //         })
    //     };
    //     search();
    // }
}