/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/27
 */
import Stage from "./stage.js";
import Resource from "../tool/resource.js";
import Common from "../tool/common.js";
import Play from "../item/play.js";
import Status from "../tool/status.js";
import Control from "../tool/control.js";
import Sound from "../tool/sound.js";
import Tank from "../item/game/tank.js";
import Confirm from "../item/confirm.js";
import MapItem from "../item/game/mapitem.js";
import Bullet from "../item/game/bullet.js";
import Height from "../item/game/height.js";
import Success from "../item/game/success.js";
import Failed from "../item/game/failed.js";

export default class Room extends Stage {
    constructor() {
        super();

        /**
         *
         * @type {{roomId,roomType,mapId,subId}}
         */
        this.roomInfo = {};
        this.size = {};
        this.view = {x: 0, y: 0, center: null};

        this.mask = true;
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

        //加载字体
        const myFont = new FontFace('gameFont', 'url(font/RuiZiZhenYanTiMianFeiShangYong-2.ttf)');
        myFont.load().then(font => {
            document.fonts.add(font)
        });
    }

    initControlEvent() {
        const thisRoom = this;
        //返回按钮
        thisRoom.createControl({
            leftTop: {
                x: -130,
                y: 30
            },
            size: {
                w: 100,
                h: 100
            },
            needOffset: false,
            callBack: function () {
                //返回主菜单(暂停状态不能返回)
                if (!Status.isGaming()) {
                    return;
                }

                new Confirm(
                    thisRoom,
                    "返回主菜单",
                    ["返回主菜单将不会获得任何积分和金币，确定要返回吗？"],
                    function () {
                        Resource.getRoot().gotoStage("menu");
                    });
            }
        })
    }

    init(roomInfo) {
        this.roomInfo = roomInfo;
        Resource.getRoot().addEngine(roomInfo.isNet);
        this.clear();
        Status.setStatus(Status.statusPause());

        //TODO 输入框相关，后期优化
        //Adapter.instance.inputEnable = true;
    }

    showTeam() {
        return this.roomInfo.roomType === "PVP";
    }

    clear() {
        this.showMask();
        this.reloadBackground();
        this.items.clear();
        this.controlUnits.clear();
        this.initControlEvent();
        this.view.center = null;
    }

    reloadBackground() {
        const imageId = "room_background_" + (Math.round(Math.random()) + 1);
        this.backgroundImage = Resource.getImage(imageId);
    }

    showMask() {
        this.maskStartTime = new Date().getTime();
        this.mask = true;
        Sound.bgm();

        //初始化玩家/敌方生命，为开头显示生命信息做准备
        this.maskPlayerLife = null;
        this.maskEnemyLife = null;
        this.roomInfo.playerLife = null;
        this.roomInfo.computerLife = null;
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
            thisRoom.mask = false;
        }, frames);
    }

    generateMaskInfo() {
        if (this.roomInfo.roomType === "PVP") {
            return "对抗模式";
        }
        if (!this.roomInfo.isNet) {
            return "单人模式 " + this.roomInfo.mapId + "-" + this.roomInfo.subId;
        } else {
            return "合作模式 " + this.roomInfo.mapId + "-" + this.roomInfo.subId;
        }
    }

    update() {
        this.updateView();
        super.update();
    }

    updateView() {
        if (!this.size.width || !this.size.height) {
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

        const center = {
            x: this.view.center.x * Resource.getRoomScale(),
            y: this.view.center.y * Resource.getRoomScale()
        };

        if (!updateX) {
            this.view.x = center.x - Resource.width() / 2;
            if (this.view.x < 0) {
                this.view.x = 0;
            }
            if (this.view.x > this.size.width - Resource.width()) {
                this.view.x = this.size.width - Resource.width()
            }
        }

        if (!updateY) {
            this.view.y = center.y - Resource.height() / 2;
            if (this.view.y < 0) {
                this.view.y = 0;
            }
            if (this.view.y > this.size.height - Resource.height()) {
                this.view.y = this.size.height - Resource.height()
            }
        }
    };

    draw(ctx) {
        this.drawBackground(ctx);
        this.drawItems(ctx);
        this.drawControl(ctx);
        this.drawRoomInfo(ctx);
        this.drawMask(ctx);
    }

    drawItems(ctx) {
        //获取并排序所有屏幕内的元素
        //先绘制GameItem，再绘制CommonItem
        const gameItems = [];
        const commonItems = [];
        this.items.forEach(item => {
            if (item.getType() === "game") {
                //滤掉屏幕外的元素
                if (!item.isInScreen()) {
                    return;
                }
                gameItems[gameItems.length] = item;
                this.drawEffect(item, gameItems);
            } else {
                commonItems[commonItems.length] = item;
            }
        });
        gameItems.sort((item1, item2) => {
            if (item1.z !== item2.z) {
                return item1.z - item2.z;
            }
            if (item1.y !== item2.y) {
                return item1.y - item2.y;
            }
            return item1.x - item2.x;
        });

        //开始绘制
        gameItems.forEach(item => {
            item.draw(ctx);
        });
        commonItems.forEach(item => {
            item.draw(ctx);
        });
        this.drawHotZone(ctx);
    }

    drawEffect(target, container) {
        if (target.constructor.name !== "Tank") {
            return;
        }

        const shield = target.getEffectForShield();
        if (shield) {
            container[container.length] = shield;
        }

        const id = target.getEffectForId();
        if (id) {
            container[container.length] = id;
        }
    }

    drawControl(ctx) {
        Control.draw(ctx);
    }

    drawBackground(ctx) {
        //背景图
        const img = Resource.getImage("room_background");
        ctx.drawImage(
            img,
            0, 0,
            img.width, img.height,
            0, 0,
            Resource.width(), Resource.height()
        );

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
                    start.y + mapStart.y > Resource.height() ||
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
        const rect = Resource.getImage("room_rect");
        const interval = 320;

        const icons = [
            Resource.getImage("room_stage"),
            Resource.getImage("player_life"),
            Resource.getImage("enemy_life"),
            Resource.getImage("room_gold"),
            Resource.getImage("room")
        ];

        const infos = [
            this.roomInfo.mapId + "-" + this.roomInfo.subId,
            "x" + this.roomInfo.playerLife,
            "x" + this.roomInfo.computerLife,
            Resource.getUser().coin,
            this.roomInfo.roomId
        ];

        ctx.font = '36px gameFont';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF';

        for (let i = 0; i < 5; ++i) {
            ctx.drawImage(
                rect,
                0, 0,
                rect.width, rect.height,
                100 + i * interval, 50,
                rect.width * 1.7, rect.height * 1.5
            );

            const icon = icons[i];
            ctx.drawImage(
                icon,
                0, 0,
                icon.width, icon.height,
                100 + i * interval, 30,
                100, 100
            );

            ctx.fillText(infos[i], 272 + i * interval, 82);
        }

        //返回按钮
        const back = Resource.getImage("back");
        ctx.drawImage(
            back,
            0, 0,
            back.width, back.height,
            Resource.width() - 130, 30,
            100, 100
        );
    }

    drawMask(ctx) {
        if (!this.mask) {
            return;
        }

        //绘制背景
        ctx.fillStyle = '#01A7EC';
        ctx.fillRect(0, 0, Resource.width(), Resource.height());
        ctx.fillStyle = '#22b2ee';
        ctx.fillRect(0, Resource.height() * .32,
            Resource.width(),
            270);

        //显示标题
        ctx.font = '100px gameFont';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF';
        ctx.fillText(this.generateMaskInfo(), Resource.width() / 2, Resource.height() * .4);

        //显示难度
        const img = Resource.getImage(this.roomInfo.hardMode ? "room_hard" : "room_easy");
        ctx.drawImage(img,
            0, 0,
            img.width, img.height,
            Resource.width() * .85, 0,
            img.width * 2, img.height * 2);

        //绘制生命
        if (this.maskPlayerLife === null || this.maskEnemyLife === null) {
            if (this.roomInfo.playerLife === null || this.roomInfo.computerLife === null) {
                //还未加载完毕，不显示生命
                return;
            } else {
                //赋值，防止后面做变更
                this.maskPlayerLife = this.roomInfo.playerLife;
                this.maskEnemyLife = this.roomInfo.computerLife;
            }
        }

        ctx.font = '44px gameFont';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF';

        const playerLife = Resource.getImage("player_life");
        ctx.drawImage(playerLife,
            0, 0,
            playerLife.width, playerLife.height,
            Resource.width() / 2 - 200, Resource.height() * .32 + 170,
            100, 100);
        ctx.fillText("x" + this.maskPlayerLife,
            Resource.width() / 2 - 90,
            Resource.height() * .32 + 216);

        const enemyLife = Resource.getImage("enemy_life");
        ctx.drawImage(enemyLife,
            0, 0,
            enemyLife.width, enemyLife.height,
            Resource.width() / 2 + 20, Resource.height() * .32 + 170,
            100, 100);
        ctx.fillText("x" + this.maskEnemyLife,
            Resource.width() / 2 + 130,
            Resource.height() * .32 + 216);
    }

    /**
     *
     * @param data {{mapId,subId,playerLife,computerLife,width,height,itemList}}
     */
    loadMap(data) {
        if (data.mapId !== undefined && data.subId !== undefined) {
            this.roomInfo.mapId = data.mapId;
            this.roomInfo.subId = data.subId;
        }
        if (data.playerLife !== undefined) {
            this.roomInfo.playerLife = data.playerLife;
        }
        if (data.computerLife !== undefined) {
            this.roomInfo.computerLife = data.computerLife;
        }
        if (data.width && data.height) {
            this.mapSize = {
                width: data.width,
                height: data.height
            };
            this.size.width = data.width * Resource.getRoomScale();
            this.size.height = data.height * Resource.getRoomScale();
            this.calculateBackgroundRepeat();
        }

        // load mapItem
        if (data.itemList) {
            data.itemList.forEach(itemData => {
                this.createOrUpdateMapItem(itemData);
            })
        }
    }

    createMapItem(options) {
        const item = new MapItem(options);
        item.stage = this;
        this.addItem(item);
        return item;
    }

    createOrUpdateMapItem(data) {
        let item;
        if (this.items.has(data.id)) {
            item = this.items.get(data.id);
        } else {
            item = this.createMapItem({id: data.id})
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
                item.image = Resource.getOrCreateImage("brick");
                item.orientation = 0;
                break;
            case 1:
                item.image = Resource.getOrCreateImage("brick");
                item.orientation = 1;
                break;
            case 2:
                item.image = Resource.getOrCreateImage("iron");
                item.orientation = 0;
                break;
            case 3:
                item.image = Resource.getOrCreateImage("iron");
                item.orientation = 1;
                break;
            case 4:
                item.image = Resource.getOrCreateImage("river");
                item.z = Height.river();
                break;
            case 5:
                item.image = Resource.getOrCreateImage("grass");
                item.z = Height.grass();
                break;
            case 6:
                item.image = Resource.getOrCreateImage("red_king");
                break;
            case 7:
                item.image = Resource.getOrCreateImage("blue_king");
                break;
        }
    };

    setBarrier(item, typeId) {
        if (typeId !== 5) {
            item.isBarrier = true;
        }
    }

    calculateBackgroundRepeat() {
        this.backgroundImage.repeatX = Math.round(this.size.width / this.backgroundImage.width);
        this.backgroundImage.repeatY = Math.round(this.size.height / this.backgroundImage.height);
        if (this.backgroundImage.repeatX === 0) {
            this.backgroundImage.repeatX = 1;
        }
        if (this.backgroundImage.repeatY === 0) {
            this.backgroundImage.repeatY = 1;
        }

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

        Status.setStatus(Status.statusPause());

        if (status.type === "END") {
            new Success(this, status.score, status.rank);
            return;
        }

        if (status.type === "WIN") {
            new Success(this, status.score, status.rank);
            //没有关卡了，回到主页
            Common.addTimeEvent("back_to_menu", function () {
                Common.gotoStage("menu");
            }, 480);
            return;
        }

        if (status.type === "LOSE") {
            new Failed(this, status.score, status.rank);
            return;
        }

        if (status.type === "LOSE_PVP") {
            new Failed(this, status.score, status.rank, true);
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
        tankItem.image = this.getTankImageFromTankData(tankData);
    };

    getTankImageFromTankData(data) {
        if (this.showTeam()) {
            const team = data.teamId === 1 ? "red_" : "blue_";
            return Resource.getImage(team + data.typeId);
        } else {
            return Resource.getImage(data.typeId);
        }
    }

    updateTankControl(tankData, force) {
        const tankItem = this.items.get(tankData.id);
        //优化前端闪烁显示
        if (!force &&
            tankItem.orientation === tankData.orientation &&
            tankItem.action === tankData.action &&
            Common.distance(tankData.x, tankData.y, tankItem.x, tankItem.y) < 20) {
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

        item.showId = thisRoom.isShowId(item.teamId);
        return item;
    };

    isShowId(teamId) {
        if (!this.roomInfo.isNet) {
            return false;
        }

        if (this.roomInfo.roomType === "PVP") {
            return true;
        }

        return teamId === 1;

    }

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
        item.z = Height.bomb();
        item.image = Resource.getOrCreateImage("bomb");
        const thisRoom = this;
        item.play = new Play(
            6,
            3,
            function () {
                item.orientation = 6 - this.frames;
            }, function () {
                thisRoom.items.delete(item.id);
            });

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
        const thisStage = this;
        ammoList.forEach(function (ammo) {
            if (thisStage.items.has(ammo.id)) {
                //已存在
                thisStage.generalUpdateAttribute(ammo);
            } else {
                const bullet = thisStage.createBullet({
                    id: ammo.id,
                    x: ammo.x,
                    y: ammo.y,
                    orientation: ammo.orientation,
                    speed: ammo.speed,
                    teamId: ammo.teamId
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
    }

    createBullet(options) {
        const item = new Bullet(options);
        item.stage = this;
        this.addItem(item);
        item.action = 1;
        item.image = Resource.getOrCreateImage("bullet");
        return item;
    };

    createGameItem(itemList) {
        const thisRoom = this;
        itemList.forEach(function (itemData) {
            if (thisRoom.items.has(itemData.id)) {
                return;
            }
            const imageId = "item_" + itemData.typeId.toLowerCase();
            const gameItem = thisRoom.createMapItem({
                id: itemData.id,
                x: itemData.x,
                y: itemData.y,
                z: Height.item(),
                typeId: itemData.typeId.toLowerCase(),
                image: Resource.getImage(imageId),
                scale: 0.28
            });
            gameItem.play = new Play(1, 15,
                function () {
                    if (gameItem.scale === 0.28) {
                        gameItem.scale = 0.22;
                    } else {
                        gameItem.scale = 0.28;
                    }
                }, function () {
                    this.frames = 1;
                });
        });
    };

    getId() {
        return "room";
    }
}