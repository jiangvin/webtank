/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/27
 */
import stage from "./stage.js";
import Resource from "../tool/resource.js";
import Common from "../tool/common.js";
import Play from "./play.js";
import Status from "../tool/status.js";

export default class room extends stage {
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
        this.maskImage = Resource.getImage("background_loading");
        this.maskInfo = null;
    }

    init(roomInfo) {
        this.roomInfo = roomInfo;

        let displayNum;
        if (this.roomInfo.mapId < 10) {
            displayNum = "0" + this.roomInfo.mapId;
        } else {
            displayNum = "" + this.roomInfo.mapId;
        }
        this.maskInfo = "MISSION " + displayNum;
    }

    update() {
        this.updateView();
        super.update();
    }

    updateView() {
        if (!this.size.width || !this.size.height) {
            return;
        }

        if (Status.getValue() !== Status.statusNormal()) {
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
        this.drawMask(ctx);
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

                ctx.drawImage(this.backgroundImage,
                    0, 0,
                    this.backgroundImage.width, this.backgroundImage.height,
                    start.x + mapStart.x, start.y + mapStart.y,
                    this.backgroundImage.sizeX, this.backgroundImage.sizeY);
            }
        }
    }

    drawRoomInfo(ctx) {
        //标题
        const tipMessage = '房间号:' + this.roomInfo.roomId +
            " 关卡:" + this.roomInfo.mapId + " [" + this.roomInfo.roomType + "]";
        this.drawTips(ctx, tipMessage, 10, 6);

        //相关信息
        if (this.roomInfo.roomType === 'PVE' && this.roomInfo.playerLife !== undefined) {
            this.drawTips(ctx,
                "玩家剩余生命:" + this.roomInfo.playerLife,
                10, 24);
            this.drawTips(ctx,
                "电脑剩余生命:" + this.roomInfo.computerLife,
                10, 40);
        } else if (this.roomInfo.playerLife !== undefined) {
            this.drawTips(ctx,
                "红队剩余生命:" + this.roomInfo.playerLife,
                10, 24);
            this.drawTips(ctx, "蓝队剩余生命:" + this.roomInfo.computerLife,
                10, 40);
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

        Common.drawTitle(ctx, this.maskInfo);
    }

    drawTips(ctx, tips, x, y) {
        ctx.font = '14px Helvetica';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(tips, x, y);
    }

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

        this.setBarrier(item, typeId);
        const position = this.getPositionFromId(data.id);
        item.x = position.x;
        item.y = position.y;

        //调整z值
        if (typeId === 5) {
            item.z = 2;
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
                break;
            case 1:
                item.image = Resource.getImage("brick");
                item.orientation = 1;
                break;
            case 2:
                item.image = Resource.getImage("iron");
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

    getPositionFromId(id) {
        const position = {};
        const infos = id.split("_");
        const size = Resource.getUnitSize();
        position.x = parseInt(infos[0]) * size + size / 2;
        position.y = parseInt(infos[1]) * size + size / 2;
        return position;
    };

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
        const imageRate = this.backgroundImage.width / this.backgroundImage.height;
        const mapRate = this.size.width / this.size.height;
        if (mapRate >= imageRate * 0.7 && mapRate <= imageRate * 1.3) {
            this.backgroundImage.repeatX = 1;
            this.backgroundImage.repeatY = 1;
        } else {
            if (mapRate < imageRate * 0.7) {
                this.backgroundImage.repeatX = 1;
                this.backgroundImage.repeatY = Math.round(this.size.height / (this.size.width / imageRate));
            } else {
                this.backgroundImage.repeatY = 1;
                this.backgroundImage.repeatX = Math.round(this.size.width / (this.size.height * imageRate));
            }
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

    processSocketMessage(messageDto) {
        switch (messageDto.messageType) {
            case "SERVER_READY":
                this.mask = false;
                break;
            case "TANKS":
                //除了坦克之间的碰撞以外其他情况不更新自己，否则会和客户端的自动避让起冲突
                const updateSelf = messageDto.note === "COLLIDE_TANK";
                this.createOrUpdateTanks(messageDto.message, updateSelf);
                break;
            case "REMOVE_TANK":
                this.itemBomb(messageDto.message);
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
                this.items.delete(messageDto.message);
                break;
            case "CLEAR_MAP":
                this.items.clear();
                this.view.center = null;
                break;
            default:
                break;
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
                let tankImage;
                tankImage = Resource.getImage(tank.typeId);
                const tankItem = thisStage.createTank({
                    id: tank.id,
                    showId: true,
                    teamId: tank.teamId,
                    image: tankImage,
                    scale: 0.1
                });
                thisStage.updateTankProperty(tank);
                thisStage.updateTankControl(tank);
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
     * @param tankData {{typeId,speed,hasShield,id}}
     */
    updateTankProperty(tankData) {
        const tankItem = this.items.get(tankData.id);
        tankItem.speed = tankData.speed;
        tankItem.hasShield = tankData.hasShield;
        tankItem.image = Resource.getImage(tankData.typeId);
    };

    updateTankControl(tankData) {
        const tankItem = this.items.get(tankData.id);
        tankItem.x = tankData.x;
        tankItem.y = tankData.y;
        tankItem.orientation = tankData.orientation;
        tankItem.action = tankData.action;
    };

    createTank(options) {
        const item = this.createItem(options);
        const thisRoom = this;
        item.update = function () {
            thisRoom.generalUpdateEvent(item);
        };

        //set center
        if (!this.view.center && Resource.getUser().userId) {
            if (item.id === Resource.getUser().userId) {
                this.view.center = item;
            }
        }

        if (thisRoom.roomInfo.roomType === "PVE" && item.teamId === 2) {
            item.showId = false;
            return;
        }

        if (thisRoom.roomInfo.roomType === "EVE") {
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

    itemBomb(data, bombScale) {
        if (bombScale === undefined) {
            bombScale = 1;
        }

        if (!this.items.has(data.id)) {
            return;
        }

        this.generalUpdateAttribute(data);
        const item = this.items.get(data.id);
        item.action = 0;
        item.orientation = 0;
        item.scale = bombScale;
        item.z = 10;
        item.image = Resource.getImage("bomb");
        item.play = new Play(
            6,
            3,
            function () {
                item.orientation = 6 - this.frames;
            }, function () {
                this.items.delete(item.id);
            });

        //删除重加，确保在最上层绘制
        this.items.delete(item.id);
        this.items.set(item.id, item);

        //remove center
        if (item === this.view.center) {
            this.view.center = null;
        }
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
                thisStage.createBullet({
                    id: ammo.id,
                    x: ammo.x,
                    y: ammo.y,
                    orientation: ammo.orientation,
                    speed: ammo.speed
                });
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

    createGameItem(itemData) {
        if (this.items.has(itemData.id)) {
            return;
        }
        const imageId = "item_" + itemData.typeId.toLowerCase();
        const gameItem = this.createItem({
            id: itemData.id,
            x: itemData.x,
            y: itemData.y,
            image: Resource.getImage(imageId)
        });
        gameItem.play = new Play(1, 15,
            function () {
                gameItem.orientation = (gameItem.orientation + 1) % 2;
            }, function () {
                this.frames = 1;
            });
    };
}