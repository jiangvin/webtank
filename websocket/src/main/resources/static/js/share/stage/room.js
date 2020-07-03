/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/27
 */
import Stage from "./stage.js";
import Resource from "../tool/resource.js";
import Common from "../tool/common.js";
import Play from "./play.js";
import Status from "../tool/status.js";
import Control from "../tool/control.js";
import Button from "./button.js";
import Sound from "../tool/sound.js";
import Rect from "./rect.js";
import Item from "./item.js";
import Tank from "./tank.js";
import Confirm from "./confirm.js";

export default class Room extends Stage {
    constructor() {
        super();

        /**
         *
         * @type {{roomId,roomType,mapId}}
         */
        this.roomInfo = {};
        this.size = {};
        this.view = {x: 0, y: 0, center: null};

        this.backgroundImage = Resource.getImage("background", "jpg");

        this.mask = true;
        this.maskImage = Resource.getImage("background_loading", "jpg");
        this.maskStartTime = 0;
        this.minMaskTime = 3000;

        this.control = {
            orientation: 0,
            action: 0,
            cache: {}
        };

        /**
         * 阻挡一些不需要发送的情况
         * @type {{orientation: number, x: number, action: number, y: number}}
         */
        this.send = {
            orientation: 0,
            action: 0,
            x: 0,
            y: 0
        };
    }

    init(roomInfo) {
        this.roomInfo = roomInfo;
        this.showTeam = roomInfo.showTeam;
        this.clear();
        Status.setStatus(Status.statusPause(), this.generateMaskInfo());
        Sound.bgm();
    }

    clear() {
        this.showMask();
        this.items.clear();
        this.controlUnits.clear();
        this.view.center = null;
    }

    showMask() {
        this.maskStartTime = new Date().getTime();
        this.mask = true;
    }

    hideMask() {
        let frames = (this.minMaskTime - (new Date().getTime() - this.maskStartTime)) / 1000 * 60;
        if (frames < 0) {
            frames = 0;
        }
        if (frames > 180) {
            frames = 180;
        }
        const thisRoom = this;
        Common.addTimeEvent("hide_mask", function () {
            Status.setStatus(null, null);
            thisRoom.mask = false;
        }, frames);
    }

    generateMaskInfo() {
        if (this.roomInfo.roomType === "PVP") {
            return "RED vs BLUE";
        }

        let displayNum;
        if (this.roomInfo.mapId < 10) {
            displayNum = "0" + this.roomInfo.mapId;
        } else {
            displayNum = "" + this.roomInfo.mapId;
        }
        return "MISSION " + displayNum;
    }

    update() {
        this.updateView();
        super.update();
    }

    updateView() {
        if (!this.size.width || !this.size.height) {
            return;
        }

        if (Status.getValue() === Status.statusPause()) {
            return;
        }

        let updateX = false;
        let updateY = false;
        if (this.size.width < Resource.width()) {
            updateX = true;
            this.view.x = (this.size.width - Resource.width()) / 2;
        }
        if (this.size.height < Resource.height()) {
            updateY = true;
            this.view.y = (this.size.height - Resource.height()) / 2;
        }

        if ((updateX && updateY) || !this.view.center) {
            return;
        }

        if (!updateX) {
            this.view.x = this.view.center.x - Resource.width() / 2;
            if (this.view.x < 0) {
                this.view.x = 0;
            }
            if (this.view.x > this.size.width - Resource.width()) {
                this.view.x = this.size.width - Resource.width()
            }
        }

        if (!updateY) {
            this.view.y = this.view.center.y - Resource.height() / 2;
            if (this.view.y < 0) {
                this.view.y = 0;
            }
            if (this.view.y > this.size.height - Resource.height()) {
                this.view.y = this.size.height - Resource.height()
            }
        }
    };

    draw(ctx) {
        //每秒排序一次
        if (Resource.getRoot().frontFrame.totalFrames % 60 === 0) {
            this.sortItems();
        }

        this.drawBackground(ctx);
        super.draw(ctx);
        Control.draw(ctx);
        this.drawMask(ctx);
        this.drawStatus(ctx);
        this.drawRoomInfo(ctx);
    }

    drawBackground(ctx) {
        if (!this.size.width || !this.size.height || !this.backgroundImage) {
            return;
        }

        if (!this.backgroundImage.repeatX || !this.backgroundImage.repeatY) {
            this.calculateBackgroundRepeat();
        }

        const mapStart = this.convertToScreenPoint({x: 0, y: 0});
        for (let x = 0; x < this.backgroundImage.repeatX; ++x) {
            for (let y = 0; y < this.backgroundImage.repeatY; ++y) {
                const start = {};
                const end = {};
                start.x = x * this.backgroundImage.sizeX;
                start.y = y * this.backgroundImage.sizeY;

                end.x = start.x + this.backgroundImage.sizeX;
                end.y = start.y + this.backgroundImage.sizeY;

                if (start.x + mapStart.x > Resource.width() ||
                    start.y + mapStart.y  > Resource.height() ||
                    end.x + mapStart.x < 0 ||
                    end.y + mapStart.y < 0) {
                    continue;
                }

                ctx.drawImage(this.backgroundImage,
                    0, 0,
                    this.backgroundImage.width, this.backgroundImage.height,
                    start.x + mapStart.x, start.y + mapStart.y,
                    this.backgroundImage.sizeX, this.backgroundImage.sizeY);
            }
        }
    }

    drawRoomInfo(ctx) {
        ctx.font = '14px Helvetica';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#ffffff';

        //标题
        if (this.roomInfo.roomId) {
            const tipMessage = '房间号:' + this.roomInfo.roomId +
                " 关卡:" + this.roomInfo.mapId + " [" + this.roomInfo.roomType + "]";
            ctx.fillText(tipMessage, 10, 6);
        }

        //相关信息
        if (this.roomInfo.roomType === 'PVE' && this.roomInfo.playerLife !== undefined) {
            ctx.fillText("玩家剩余生命:" + this.roomInfo.playerLife, 10, 24);
            ctx.fillText("电脑剩余生命:" + this.roomInfo.computerLife, 10, 40);
        } else if (this.roomInfo.playerLife !== undefined) {
            ctx.fillText("红队剩余生命:" + this.roomInfo.playerLife, 10, 24);
            ctx.fillText("蓝队剩余生命:" + this.roomInfo.computerLife, 10, 40);
        }
    }

    drawMask(ctx) {
        if (!this.mask) {
            return;
        }

        ctx.drawImage(this.maskImage,
            0, 0,
            this.maskImage.width, this.maskImage.height,
            0, 0,
            Resource.width(), Resource.height());
    }

    drawStatus(ctx) {
        if (Status.getMessage()) {
            ctx.font = 'bold 55px Microsoft YaHei UI';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#FFF';
            ctx.fillText(Status.getMessage(), Resource.width() / 2, Status.getHeight());
        }
    }

    /**
     *
     * @param data {{mapId,playerLife,computerLife,width,height,itemList}}
     */
    loadMap(data) {
        if (data.mapId !== undefined) {
            this.roomInfo.mapId = data.mapId;
        }
        if (data.playerLife !== undefined) {
            this.roomInfo.playerLife = data.playerLife;
        }
        if (data.computerLife !== undefined) {
            this.roomInfo.computerLife = data.computerLife;
        }
        if (data.width && data.height) {
            this.size.width = data.width;
            this.size.height = data.height;
            this.calculateBackgroundRepeat();
        }

        // load mapItem
        const thisRoom = this;
        if (data.itemList) {
            data.itemList.forEach(function (itemData) {
                thisRoom.createOrUpdateMapItem(itemData);
            })
        }

        this.sortItems();
    }

    createOrUpdateMapItem(data) {
        let item;
        if (this.items.has(data.id)) {
            item = this.items.get(data.id);
        } else {
            item = this.createItem({id: data.id})
        }

        const typeId = parseInt(data.typeId);
        this.setResourceImage(item, typeId);
        if (!item.image) {
            return;
        }

        item.typeId = typeId;
        this.setBarrier(item, typeId);
        const position = Common.getPositionFromId(data.id);
        item.x = position.x;
        item.y = position.y;

        //调整z值
        if (typeId === 5) {
            item.z = 4;
        } else if (typeId === 4) {
            item.z = -4;
        }

        //播放动画
        switch (typeId) {
            case 4:
            case 6:
            case 7:
                item.play = new Play(1, 30,
                    function () {
                        item.orientation = (item.orientation + 1) % 2;
                    }, function () {
                        this.frames = 1;
                    });
                break;
        }
    }

    setResourceImage(item, typeId) {
        switch (typeId) {
            case 0:
                item.image = Resource.getImage("brick");
                item.orientation = 0;
                break;
            case 1:
                item.image = Resource.getImage("brick");
                item.orientation = 1;
                break;
            case 2:
                item.image = Resource.getImage("iron");
                item.orientation = 0;
                break;
            case 3:
                item.image = Resource.getImage("iron");
                item.orientation = 1;
                break;
            case 4:
                item.image = Resource.getImage("river");
                break;
            case 5:
                item.image = Resource.getImage("grass");
                break;
            case 6:
                item.image = Resource.getImage("red_king");
                break;
            case 7:
                item.image = Resource.getImage("blue_king");
                break;
        }
    };

    setBarrier(item, typeId) {
        if (typeId !== 5) {
            item.isBarrier = true;
        }
    }

    sortItems() {
        //支援ES5的兼容写法
        const array = [];
        this.items.forEach(function (item) {
            array[array.length] = item;
        });

        array.sort(function (item1, item2) {
            if (item1.z !== item2.z) {
                return item1.z - item2.z;
            }

            if (item1.y !== item2.y) {
                return item1.y - item2.y;
            }

            return item1.x - item2.x;
        });

        this.items = new Map();
        const map = this.items;
        array.forEach(function (item) {
            map.set(item.id, item);
        })
    };


    calculateBackgroundRepeat() {
        this.backgroundImage.repeatX = Math.round(this.size.width / this.backgroundImage.width);
        this.backgroundImage.repeatY = Math.round(this.size.height / this.backgroundImage.height);

        this.backgroundImage.sizeX = this.size.width / this.backgroundImage.repeatX;
        this.backgroundImage.sizeY = this.size.height / this.backgroundImage.repeatY;
    };

    /**
     * 真实坐标转换屏幕坐标
     * @param point
     */
    convertToScreenPoint(point) {
        const screenPoint = {};
        screenPoint.x = point.x - this.view.x;
        screenPoint.y = point.y - this.view.y;
        return screenPoint;
    };

    /**
     *
     * @param messageDto {{note,message,messageType}}
     */
    processSocketMessage(messageDto) {
        switch (messageDto.messageType) {
            case "TANKS":
                //除了坦克之间的碰撞以外其他情况不更新自己，否则会和客户端的自动避让起冲突
                const updateSelf = messageDto.note === "COLLIDE_TANK";
                this.createOrUpdateTanks(messageDto.message, updateSelf);
                break;
            case "REMOVE_TANK":
                this.boomTank(messageDto.message);
                break;
            case "BULLET":
                this.createOrUpdateBullets(messageDto.message);
                break;
            case "REMOVE_BULLET":
                this.itemBomb(messageDto.message, 0.5);
                break;
            case "MAP":
                this.loadMap(messageDto.message);
                this.sortItems();
                break;
            case "REMOVE_MAP":
                this.itemBomb({id: messageDto.message});
                break;
            case "ITEM":
                this.createGameItem(messageDto.message);
                break;
            case "REMOVE_ITEM":
                this.removeGameItem(messageDto.message);
                break;
            case "CLEAR_MAP":
                this.clear();
                break;
            case "SERVER_READY":
                this.hideMask();
                break;
            case "GAME_STATUS":
                this.gameStatus(messageDto.message);
                break;
            default:
                break;
        }
    }

    removeGameItem(id) {
        if (!this.items.has(id)) {
            return;
        }

        const item = this.items.get(id);
        this.items.delete(id);

        if (this.view.center) {
            const center = this.view.center;
            if (Common.distance(center.x, center.y, item.x, item.y) <= Resource.getUnitSize() + 5) {
                Sound.catchItem();
            }
        }
    }

    gameStatus(status) {
        if (status.type === "NORMAL") {
            Status.setStatus(Status.statusNormal());
            return;
        }
        if (status.type === "PAUSE_RED") {
            Status.setStatus(Status.statusPauseRed());
            return;
        }
        if (status.type === "PAUSE_BLUE") {
            Status.setStatus(Status.statusPauseBlue());
            return;
        }

        //其他结束状态
        let titleHeight = Resource.height() * .4;
        let buttonHeight = Resource.height() * 0.55;
        if (status.score && status.rank) {
            //计分板
            const rect = new Rect(
                Resource.width() / 2,
                Resource.height() * .4,
                Resource.width() * .6,
                Resource.height() * .4);
            this.addItem(rect);
            const score = new Item({
                z: 10,
                draw: function (ctx) {
                    ctx.font = 'bold 30px Microsoft YaHei UI';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#FFF';
                    ctx.fillText("当前得分: " + status.score,
                        Resource.width() / 2,
                        Resource.height() * .3 + 60);

                    ctx.fillText("当前排名: " + status.rank,
                        Resource.width() / 2,
                        Resource.height() * .3 + 100);
                }
            });
            this.addItem(score);
            titleHeight = Resource.height() * .3;
            buttonHeight = Resource.height() * 0.68;
        }
        Status.setStatus(Status.statusPause(), status.message, titleHeight);
        if (status.type === "WIN") {
            const back = new Button("返回主菜单", Resource.width() * 0.5, buttonHeight, function () {
                //同步用户信息(获得的金币等)
                Common.syncUserData();

                Resource.getRoot().lastStage();
                Resource.getRoot().currentStage().initMenu();
            });
            this.addItem(back);
        } else if (status.type === "LOSE") {
            const again = new Button("", Resource.width() * 0.5, buttonHeight, function () {
                Resource.getRoot().engine.again();
            });
            again.drawText = function (ctx) {
                ctx.font = '30px Arial';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fff';
                ctx.fillText("重玩本关", this.x - 95, this.y);

                const coin = Resource.getImage("coin");
                ctx.drawImage(coin,
                    0, 0,
                    coin.width, coin.height,
                    this.x + 27, this.y - 15,
                    30, 30);

                ctx.font = '20px Arial';
                ctx.fillText("x 30", this.x + 60, this.y);
            };
            this.addItem(again);
            buttonHeight += 75;
            const back = new Button("返回主菜单", Resource.width() * 0.5, buttonHeight, function () {
                //同步用户信息(获得的金币等)
                Common.syncUserData();

                Resource.getRoot().lastStage();
                Resource.getRoot().currentStage().initMenu();
            });
            this.addItem(back);
        }

        if (status.message.indexOf("失败") >= 0) {
            Sound.lose();
        } else if (status.message.indexOf("恭喜") >= 0 || status.message.indexOf("胜利") >= 0) {
            Sound.win();
        } else if (status.message.indexOf("MISSION") >= 0) {
            Sound.bgm();
        }
    }

    createOrUpdateTanks(tanks, force) {
        const thisStage = this;
        const center = thisStage.view.center;
        tanks.forEach(function (tank) {
            if (thisStage.items.has(tank.id)) {
                thisStage.updateTankProperty(tank);
                //普通模式除非撞上tank，否则过滤自己
                if (!force && center && center.id === tank.id) {
                    return;
                }
                //已存在
                thisStage.updateTankControl(tank);
            } else {
                const tankItem = thisStage.createTank({
                    id: tank.id,
                    showId: true,
                    teamId: tank.teamId,
                    scale: 0.1
                });
                thisStage.updateTankProperty(tank);
                thisStage.updateTankControl(tank, true);
                tankItem.play = new Play(30, 1,
                    function () {
                        tankItem.scale += this.animationScale;
                    },
                    function () {
                        tankItem.scale = 1;
                    });
                tankItem.play.animationScale = 0.03;
            }
        });
    };

    /**
     *
     * @param tankData {{typeId,speed,hasShield,id,hasGhost}}
     */
    updateTankProperty(tankData) {
        const tankItem = this.items.get(tankData.id);
        tankItem.speed = tankData.speed;
        tankItem.hasShield = tankData.hasShield;
        tankItem.hasGhost = tankData.hasGhost;
        tankItem.image = Resource.getImage(tankData.typeId);
    };

    updateTankControl(tankData, force) {
        const tankItem = this.items.get(tankData.id);
        //优化前端闪烁显示
        if (!force && tankItem.orientation === tankData.orientation && tankItem.action === tankData.action) {
            return;
        }
        tankItem.orientation = tankData.orientation;
        tankItem.action = tankData.action;
        tankItem.x = tankData.x;
        tankItem.y = tankData.y;
    };

    createTank(options) {
        const item = new Tank(options);
        item.stage = this;
        this.items.set(item.id, item);

        const thisRoom = this;

        //set center
        if (!this.view.center && Resource.getUser().userId) {
            if (item.id === Resource.getUser().userId) {
                this.view.center = item;
            }
        }

        if (thisRoom.roomInfo.roomType === "PVE" && item.teamId === 2) {
            item.showId = false;
        } else if (thisRoom.roomInfo.roomType === "EVE") {
            item.showId = false;
        }
        return item;
    };

    generalUpdateEvent(item) {
        if (item.play) {
            item.play.update();
        }

        if (item.action === 0) {
            return;
        }

        switch (item.orientation) {
            case 0:
                item.y -= item.speed;
                break;
            case 1:
                item.y += item.speed;
                break;
            case 2:
                item.x -= item.speed;
                break;
            case 3:
                item.x += item.speed;
                break;
        }
    };

    boomTank(data) {
        const tank = this.itemBomb(data);
        if (tank.id === Resource.getUser().userId) {
            Sound.boom();
            return;
        }

        if (this.view.center) {
            const center = this.view.center;
            const distance = Common.distance(tank.x, tank.y, center.x, center.y);
            if (distance <= Resource.getUnitSize() * 8) {
                Sound.boom();
            }
        }
    }

    itemBomb(data, bombScale) {
        if (bombScale === undefined) {
            bombScale = 1;
        }

        if (!this.items.has(data.id)) {
            return null;
        }

        this.generalUpdateAttribute(data);
        const item = this.items.get(data.id);

        //防止再做碰撞
        item.typeId = -1;

        item.action = 0;
        item.orientation = 0;
        item.scale = bombScale;
        item.z = 10;
        item.image = Resource.getImage("bomb");
        const thisRoom = this;
        item.play = new Play(
            6,
            3,
            function () {
                item.orientation = 6 - this.frames;
            }, function () {
                thisRoom.items.delete(item.id);
            });

        //删除重加，确保在最上层绘制
        this.items.delete(item.id);
        this.items.set(item.id, item);

        //remove center
        if (item === this.view.center) {
            this.view.center = null;
        }

        return item;
    };

    generalUpdateAttribute(newAttr) {
        //没有坐标则什么也不更新
        if (newAttr.x === undefined || newAttr.y === undefined) {
            return;
        }
        this.items.get(newAttr.id).x = newAttr.x;
        this.items.get(newAttr.id).y = newAttr.y;
        this.items.get(newAttr.id).orientation = newAttr.orientation;
        this.items.get(newAttr.id).speed = newAttr.speed;
        this.items.get(newAttr.id).action = newAttr.action;
    };

    createOrUpdateBullets(ammoList) {
        let addNew = false;
        const thisStage = this;
        ammoList.forEach(function (ammo) {
            if (thisStage.items.has(ammo.id)) {
                //已存在
                thisStage.generalUpdateAttribute(ammo);
            } else {
                addNew = true;
                const bullet = thisStage.createBullet({
                    id: ammo.id,
                    x: ammo.x,
                    y: ammo.y,
                    orientation: ammo.orientation,
                    speed: ammo.speed
                });

                if (thisStage.view.center) {
                    const center = thisStage.view.center;
                    const distance = Common.distance(bullet.x, bullet.y, center.x, center.y);
                    if (distance <= Resource.getUnitSize() + 5) {
                        Sound.fire();
                    }
                }
            }
        });
        if (addNew) {
            thisStage.sortItems();
        }
    }

    createBullet(options) {
        const item = this.createItem(options);
        item.action = 1;
        item.image = Resource.getImage("bullet");
        const thisStage = this;
        item.update = function () {
            thisStage.generalUpdateEvent(item);
        };
        return item;
    };

    createGameItem(itemList) {
        const thisRoom = this;
        itemList.forEach(function (itemData) {
            if (thisRoom.items.has(itemData.id)) {
                return;
            }
            const imageId = "item_" + itemData.typeId.toLowerCase();
            const gameItem = thisRoom.createItem({
                id: itemData.id,
                x: itemData.x,
                y: itemData.y,
                typeId: itemData.typeId.toLowerCase(),
                image: Resource.getImage(imageId)
            });
            gameItem.play = new Play(1, 15,
                function () {
                    gameItem.orientation = (gameItem.orientation + 1) % 2;
                }, function () {
                    this.frames = 1;
                });
        });
    };

    processPointDownEvent(point) {
        super.processPointDownEvent(point);

        //返回主菜单(暂停状态不能返回)
        if (point.x < Resource.width() - 140 ||
            point.y > 40 ||
            !Status.isGaming()) {
            return;
        }

        new Confirm(
            this,
            "返回主菜单",
            ["返回主菜单将不会获得任何积分和金币，确定要返回吗？"],
            function () {
                //同步用户信息(获得的金币等)
                Common.syncUserData();

                Resource.getRoot().lastStage();
                Resource.getRoot().currentStage().initMenu();
            });
    }
}