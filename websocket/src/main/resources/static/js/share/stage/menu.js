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
import Setting from "../item/setting.js";

export default class Menu extends Stage {
    constructor() {
        super();

        this.createFullScreenItem("menu_background");
        this.createBullet();
        this.createDoor();
        this.createFullScreenItem("menu_wall");
        this.createTopInfo();

        this.initButton();
    }

    createTopInfo() {
        const iconInfo = [
            {
                id: "menu_head",
                scale: 1,
                info: function () {
                    return Resource.getUser().userId;
                }
            },
            {
                id: "star",
                scale: 0.92,
                offsetY: -5,
                info: function () {
                    return Resource.getUser().star;
                }
            },
            {
                id: "gold",
                scale: 1.15,
                info: function () {
                    return Resource.getUser().coin;
                }
            }
        ];
        const info = {
            rectW: 280,
            rectH: 60,
            interval: 60,
            iconSize: 80
        };

        //generate start pos
        info.startY = 15;
        info.startX = Resource.formatWidth() / 2;
        if (iconInfo.length % 2 === 0) {
            info.startX += info.interval / 2;
        } else {
            info.startX -= info.rectW / 2;
        }
        info.startX -= (Math.floor(iconInfo.length / 2) * (info.rectW + info.interval));

        this.createItem({
            draw: function (ctx) {
                ctx.displayTopLeft("top_mask", 0, 0, Resource.formatWidth());
                ctx.displayCenter("menu_setting", 1827, 60, 100);

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                for (let i = 0; i < iconInfo.length; ++i) {
                    const x = info.startX + (i * (info.rectW + info.interval));

                    //rect
                    ctx.fillStyle = '#000';
                    ctx.globalAlpha = 0.3;
                    ctx.displayFillRoundRect(
                        x, info.startY,
                        info.rectW, info.rectH,
                        info.rectH / 2);
                    ctx.globalAlpha = 1;

                    //icon
                    const icon = iconInfo[i];
                    ctx.displayCenter(
                        icon.id,
                        x,
                        info.startY + info.iconSize * .4 + (icon.offsetY ? icon.offsetY : 0),
                        info.iconSize * icon.scale);

                    //text
                    ctx.fillStyle = '#FFF';
                    ctx.displayGameText(
                        icon.info(),
                        x + info.rectW * .5,
                        info.startY + info.rectH / 2,
                        30);
                }
            },
            controlUnit: new ControlUnit({
                center: {
                    x: 1827,
                    y: 60
                },
                size: {
                    w: 100,
                    h: 100
                },
                callback: () => {
                    new Setting(this);
                },
                check: () => {
                    return !this.doorStatus.enterDoor1 && !this.doorStatus.enterDoor2;
                }
            })
        });
    }

    initButton() {
        //排行榜打开按钮
        const buttonOpenRankBoard = new ControlUnit({
            leftTop: {x: 172, y: 744},
            rightBottom: {x: 376, y: 1036},
            callback: function () {
                Common.nextStage();
            }
        });
        this.controlUnits.set(buttonOpenRankBoard.id, buttonOpenRankBoard);

        //商店
        const buttonOpenShop = new ControlUnit({
            leftTop: {x: 1567, y: 793},
            rightBottom: {x: 1760, y: 1036},
            callback: function () {
                Common.gotoStage("shop");
            }
        });
        this.controlUnits.set(buttonOpenShop.id, buttonOpenShop);
    }

    createBullet() {
        const bulletMap = new Map();
        const bulletWidth = 160;

        this.createItem({
            draw: ctx => {
                bulletMap.forEach(bullet => {
                    const width = bulletWidth * bullet.scale;
                    ctx.displayCenter("menu_bullet", bullet.x, bullet.y, width);
                });

                //黑色遮罩，防止穿帮
                this.drawBlackMask(ctx);
            },
            update: function () {
                //create bullet
                if (Math.floor(Math.random() * 50) === 0) {
                    const bullet = {
                        id: Resource.generateClientId(),
                        x: Math.floor(Math.random() * Resource.formatWidth()),
                        y: Resource.formatHeight() / 2,
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
        const speed = 0.2;
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
        //单人模式
        const singleMode = new ControlUnit({
            leftTop: {x: 556, y: 614},
            rightBottom: {x: 748, y: 940},
            callback: () => {
                if (this.doorStatus.enterDoor1) {
                    return;
                }
                Sound.openDoor();
                this.doorStatus.enterDoor1 = true;
            },
            hasSound: false
        });
        this.controlUnits.set(singleMode.id, singleMode);

        //多人模式
        const multipleMode = new ControlUnit({
            leftTop: {x: 1220, y: 614},
            rightBottom: {x: 1412, y: 940},
            callback: () => {
                if (this.doorStatus.enterDoor2) {
                    return;
                }
                Sound.openDoor();
                this.doorStatus.enterDoor2 = true;
            },
            hasSound: false
        });
        this.controlUnits.set(multipleMode.id, multipleMode);
    }

    init() {
        this.doorStatus = {
            indexDoor1: 0,
            enterDoor1: false,
            indexDoor2: 0,
            enterDoor2: false
        };
        Resource.setNeedOffset(true);

        //同步用户信息(获得的金币等)
        Common.syncUserData();

        Connect.disconnect();
        Sound.menuBgm();
        Resource.getRoot().engine = null;
        Resource.getRoot().users = null;
        Resource.getRoot().netDelay = 0;
    }

    getId() {
        return "menu";
    }
}