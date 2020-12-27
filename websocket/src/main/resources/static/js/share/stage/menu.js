/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/26
 */

import Stage from "./stage.js";
import Resource from "../tool/resource.js";
import Common from "../tool/common.js";
import ControlUnit from "../item/controlunit.js";
import RoomInfo from "../item/roominfo.js";
import Connect from "../tool/connect.js";
import Sound from "../tool/sound.js";

export default class Menu extends Stage {
    constructor() {
        super();

        this.createFullScreenItem("menu_background");
        this.createBullet();
        this.createDoor();
        this.createFullScreenItem("menu_wall");

        //信息
        this.createItem({
            draw: function (ctx) {
                ctx.font = 'bold 26px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#FFF';
                const pos = {
                    x: 344 + Resource.getOffset().x,
                    y: 72 + Resource.getOffset().y
                };
                //姓名
                ctx.fillText(Resource.getUser().userId, pos.x, pos.y);
                //金币
                ctx.fillText(Resource.getUser().coin, pos.x + 400, pos.y);
                //排名
                ctx.fillText(Resource.getUser().rank, pos.x + 844, pos.y);
                //积分
                ctx.fillText(Resource.getUser().score, pos.x + 1266, pos.y);
            }
        });

        this.initButton();
    }

    initButton() {
        //排行榜打开按钮
        const buttonOpenRankBoard = new ControlUnit(
            Resource.generateClientId(),
            {x: 172, y: 744},
            {x: 376, y: 1036},
            function () {
                Common.nextStage();
            }
        );
        this.controlUnits.set(buttonOpenRankBoard.id, buttonOpenRankBoard);

        //商店
        const buttonOpenShop = new ControlUnit(
            Resource.generateClientId(),
            {x: 1567, y: 793},
            {x: 1760, y: 1036},
            function () {
                Common.gotoStage("shop");
            }
        );
        this.controlUnits.set(buttonOpenShop.id, buttonOpenShop);
    }

    createBullet() {
        const bulletMap = new Map();
        const bulletWidth = 160;

        this.createItem({
            draw: function (ctx) {
                bulletMap.forEach(bullet => {
                    const width = bulletWidth * bullet.scale;
                    ctx.displayCenter("menu_bullet", bullet.x, bullet.y, width);
                })
            },
            update: function () {
                //create bullet
                if (Math.floor(Math.random() * 50) === 0) {
                    const bullet = {
                        id: Resource.generateClientId(),
                        x: Math.floor(Math.random() * Resource.displayW()),
                        y: Resource.displayH() / 2,
                        scale: Math.random() + 0.1
                    };
                    bulletMap.set(bullet.id, bullet);
                }

                //move
                bulletMap.forEach(bullet => {
                    bullet.x -= 20 * bullet.scale;
                    bullet.y -= 20 * bullet.scale;
                    const width = bulletWidth * bullet.scale;
                    if (bullet.x <= -width) {
                        bulletMap.delete(bullet.id);
                    }
                })
            }
        })
    }

    createDoor() {
        const speed = 0.5;
        const doorSize = {
            w: 360,
            h: 400
        };

        this.createItem({
            draw: function (ctx) {
                const doorStatus = this.stage.doorStatus;
                ctx.displayTopLeft(
                    "menu_door_" + Math.floor(doorStatus.indexDoor1),
                    488,
                    584,
                    doorSize.w,
                    doorSize.h);
                ctx.displayTopLeft(
                    "menu_door_" + Math.floor(doorStatus.indexDoor2),
                    1152,
                    584,
                    doorSize.w,
                    doorSize.h);
            },
            update: function () {
                const doorStatus = this.stage.doorStatus;
                if (doorStatus.enterDoor1) {
                    if (doorStatus.indexDoor1 < 22) {
                        doorStatus.indexDoor1 += speed;
                    } else {
                        Common.gotoStage("mission", new RoomInfo());
                    }
                }
                if (doorStatus.enterDoor2) {
                    if (doorStatus.indexDoor2 < 22) {
                        doorStatus.indexDoor2 += speed;
                    } else {
                        Common.gotoStage("net_list");
                    }
                }
            }
        });

        //事件处理
        const thisMenu = this;
        //单人模式
        const singleMode = new ControlUnit(
            Resource.generateClientId(),
            {x: 556, y: 614},
            {x: 748, y: 940},
            function () {
                thisMenu.doorStatus.enterDoor1 = true;
            }
        );
        this.controlUnits.set(singleMode.id, singleMode);

        //多人模式
        const multipleMode = new ControlUnit(
            Resource.generateClientId(),
            {x: 1220, y: 614},
            {x: 1412, y: 940},
            function () {
                thisMenu.doorStatus.enterDoor2 = true;
            }
        );
        this.controlUnits.set(multipleMode.id, multipleMode);
    }

    init() {
        this.doorStatus = {
            indexDoor1: 0,
            enterDoor1: false,
            indexDoor2: 0,
            enterDoor2: false
        };

        //同步用户信息(获得的金币等)
        Common.syncUserData();

        Connect.disconnect();
        Sound.stopAll();
        Resource.getRoot().engine = null;
        Resource.getRoot().users = null;
        Resource.getRoot().netDelay = 0;
    }

    getId() {
        return "menu";
    }
}