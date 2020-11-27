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
            }
        );
        this.controlUnits.set(buttonOpenRankBoard.id, buttonOpenRankBoard);
    }

    createBullet() {
        const bulletMap = new Map();
        const bulletWidth = Resource.width() * .08;

        this.createItem({
            draw: function (ctx) {
                //create bullet
                if (Math.floor(Math.random() * 50) === 0) {
                    const bullet = {
                        id: Resource.generateClientId(),
                        x: Math.floor(Math.random() * Resource.width()),
                        y: Resource.height() / 2,
                        scale: Math.random() + 0.1
                    };
                    bulletMap.set(bullet.id, bullet);
                }

                //draw
                bulletMap.forEach(bullet => {
                    bullet.x -= 10 * bullet.scale;
                    bullet.y -= 10 * bullet.scale;
                    const width = bulletWidth * bullet.scale;
                    ctx.displayCenter("menu_bullet", bullet.x, bullet.y, width);
                    if (bullet.x <= -width) {
                        bulletMap.delete(bullet.id);
                    }
                })
            }
        })
    }

    createDoor() {
        const speed = 0.5;

        this.createItem({
            draw: function (ctx) {
                const doorStatus = this.stage.doorStatus;
                if (doorStatus.enterDoor1) {
                    if (doorStatus.indexDoor1 < 22) {
                        doorStatus.indexDoor1 += speed;
                    } else {
                        Common.gotoStage("mission", new RoomInfo());
                    }
                }
                if (doorStatus.enterDoor2 && doorStatus.indexDoor2 < 22) {
                    doorStatus.indexDoor2 += speed;
                }

                const doorSize = {
                    w: 250 * Resource.width() / 1334,
                    h: 280 * Resource.height() / 750
                };

                const door1 = Resource.getImage("menu_door_" + Math.floor(doorStatus.indexDoor1));
                const door2 = Resource.getImage("menu_door_" + Math.floor(doorStatus.indexDoor2));
                ctx.drawImage(
                    door1,
                    0, 0,
                    door1.width, door1.height,
                    Resource.width() * .254, Resource.height() * .54,
                    doorSize.w, doorSize.h);
                ctx.drawImage(
                    door2,
                    0, 0,
                    door2.width, door2.height,
                    Resource.width() * .6, Resource.height() * .54,
                    doorSize.w, doorSize.h);
            }
        });

        //事件处理
        const thisMenu = this;
        //单人模式
        const singleMode = new ControlUnit(
            Resource.generateClientId(),
            {x: Resource.width() * .29, y: Resource.height() * .57},
            {x: Resource.width() * .39, y: Resource.height() * .87},
            function () {
                thisMenu.doorStatus.enterDoor1 = true;
            }
        );
        this.controlUnits.set(singleMode.id, singleMode);

        //多人模式
        const multipleMode = new ControlUnit(
            Resource.generateClientId(),
            {x: Resource.width() * .636, y: Resource.height() * .57},
            {x: Resource.width() * .736, y: Resource.height() * .87},
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
    }

    getId() {
        return "menu";
    }
}