/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/28
 */
import Engine from "./engine.js";
import Common from "../tool/common.js";
import Resource from "../tool/resource.js";

export default class AiEngine extends Engine {
    static playerTypeId = "tank01";

    static keepGoingRate = 120;

    static keepTryRate = 30;

    constructor(room) {
        super(room);

        const thisEngine = this;
        thisEngine.playerLifeCount = 10;
        thisEngine.computerLifeCount = 0;

        /**
         * @type {{ammoMaxCount,ammoReloadTime,ammoSpeed,ammoMaxLifeTime}}
         */
        thisEngine.tankTypes = {};

        /**
         * @type {{playerStartPos,computerStartPos,computerStartCount,computerTypeCountList}}
         */
        thisEngine.mapInfo = {};
        thisEngine.timeEvents = [];

        thisEngine.tanks = new Map();
        thisEngine.bullets = new Map();

        Common.getRequest("/singlePlayer/getTankTypes", function (data) {
            thisEngine.tankTypes = data;
            thisEngine.loadMapDetail(function () {
                Resource.getRoot().processSocketMessage({
                    messageType: "MAP",
                    message: thisEngine.mapInfo
                });

                thisEngine.createPlayerTank();
                for (let i = 0; i < thisEngine.mapInfo.computerStartCount; ++i) {
                    thisEngine.createComputerTank();
                }

                Resource.getRoot().processSocketMessage({
                    messageType: "SERVER_READY"
                })
            })
        })
    }

    loadMapDetail(callback) {
        const thisEngine = this;
        Common.getRequest("/singlePlayer/getMapFromId?id=" + this.room.roomInfo.mapId, function (data) {
            thisEngine.mapInfo = data;
            thisEngine.mapInfo.playerLife = thisEngine.playerLifeCount;
            thisEngine.computerLifeCount = thisEngine.mapInfo.computerLife;
            callback();
        });
    }

    update() {
        super.update();

        this.updateTimeEvents();
        this.updateBullets();
        this.updateTanks();
    }

    updateBullets() {
        const thisEngine = this;
        this.bullets.forEach(function (bullet) {
            if (!bullet.item) {
                bullet.item = thisEngine.room.items.get(bullet.id);
            }
            if (!bullet.item) {
                return;
            }

            if (bullet.item.x < 0 ||
                bullet.item.y < 0 ||
                bullet.item.x > thisEngine.room.size.width ||
                bullet.item.y > thisEngine.room.size.height) {
                thisEngine.removeBullet(bullet);
                return;
            }

            if (bullet.lifeTime > 0) {
                --bullet.lifeTime;
            } else {
                thisEngine.removeBullet(bullet);
                return;
            }

            //与场景碰撞
            if (thisEngine.collideWithMapForBullet(bullet)) {
                thisEngine.removeBullet(bullet);
                return;
            }

            //与子弹碰撞
            if (thisEngine.collideWithBulletForBullet(bullet)) {
                thisEngine.removeBullet(bullet);
                return;
            }

            //与坦克碰撞
            if (thisEngine.collideWithTankForBullet(bullet)) {
                thisEngine.removeBullet(bullet);
            }

        })
    }

    collideWithBulletForBullet(bullet) {
        for (let [, target] of this.bullets) {
            if (target.id === bullet.id) {
                continue;
            }

            if (target.teamId === bullet.teamId) {
                continue;
            }

            const distance = Common.distance(target.item.x, target.item.y, bullet.item.x, bullet.item.y);
            if (distance <= Resource.getBulletSize()) {
                this.removeBullet(target);
                return true;
            }
        }
    }

    collideWithTankForBullet(bullet) {
        for (let [, tank] of this.tanks) {
            if (tank.item.teamId === bullet.teamId) {
                continue;
            }

            const distance = Common.distance(tank.item.x, tank.item.y, bullet.item.x, bullet.item.y);
            if (distance <= (Resource.getBulletSize() + Resource.getUnitSize()) / 2) {
                if (!tank.item.hasShield) {
                    this.removeTank(tank);
                }
                return true;
            }
        }
    }

    collideWithMapForBullet(bullet) {
        const mapItemId = Common.getIdFromPosition({x: bullet.item.x, y: bullet.item.y});
        if (!this.room.items.has(mapItemId)) {
            return false;
        }
        const mapItem = this.room.items.get(mapItemId);
        switch (mapItem.typeId) {
            case 0:
                this.room.createOrUpdateMapItem({
                    id: mapItemId,
                    typeId: 1
                });
                return true;
            case 1:
                Resource.getRoot().processSocketMessage({
                    messageType: "REMOVE_MAP",
                    message: mapItemId
                });
                return true;
            case 2:
                if (bullet.brokenIron) {
                    this.room.createOrUpdateMapItem({
                        id: mapItemId,
                        typeId: 3
                    });
                }
                return true;
            case 3:
                if (bullet.brokenIron) {
                    Resource.getRoot().processSocketMessage({
                        messageType: "REMOVE_MAP",
                        message: mapItemId
                    });
                }
                return true;
            case 6:
                //TODO - GAME OVER
                return true;
        }
    }

    removeBullet(bullet) {
        const thisEngine = this;
        if (thisEngine.tanks.has(bullet.tankId)) {
            ++thisEngine.tanks.get(bullet.tankId).bulletCount;
        }
        thisEngine.bullets.delete(bullet.id);
        Resource.getRoot().processSocketMessage({
            messageType: "REMOVE_BULLET",
            message: {
                id: bullet.id,
            }
        });
    }

    removeTank(tank) {
        this.tanks.delete(tank.id);
        Resource.getRoot().processSocketMessage({
            messageType: "REMOVE_TANK",
            message: {
                id: tank.id,
            }
        });
    }

    updateTanks() {
        const thisEngine = this;
        this.tanks.forEach(function (tank) {
            if (!tank.item) {
                return;
            }

            if (tank.shieldTimeout > 0) {
                --tank.shieldTimeout;
            } else {
                tank.item.hasShield = false;
            }

            if (tank.bulletReloadTime > 0) {
                --tank.bulletReloadTime;
            }

            if (tank.item.teamId !== 2) {
                return;
            }

            thisEngine.updateTankAi(tank);
        })
    }

    updateTankAi(tank) {
        if (tank.bulletReloadTime === 0 && tank.bulletCount !== 0) {
            this.tankFire(tank.id);
        }

        tank.item.action = 1;
        const forward = this.canPass(tank, tank.item.orientation);
        if (forward && Math.floor(Math.random() * AiEngine.keepGoingRate) !== 0) {
            return;
        }

        const sideList = [];
        if (tank.item.orientation === 0 || tank.item.orientation === 1) {
            if (this.canPass(tank, 2)) {
                sideList[sideList.length] = 2;
            }
            if (this.canPass(tank, 3)) {
                sideList[sideList.length] = 3;
            }
        } else {
            if (this.canPass(tank, 0)) {
                sideList[sideList.length] = 0;
            }
            if (this.canPass(tank, 1)) {
                sideList[sideList.length] = 1;
            }
        }

        if (sideList.length !== 0) {
            tank.item.orientation = sideList[Math.floor(Math.random() * sideList.length)];
            return;
        }

        if (forward) {
            return;
        }

        const back = this.getBack(tank.item.orientation);
        if (this.canPass(tank, back)) {
            tank.item.orientation = back;
            return;
        }

        tank.item.action = 0;
        if (Math.floor(Math.random() * AiEngine.keepTryRate) !== 0) {
            return;
        }
        tank.item.orientation = Math.floor(Math.random() * 4);
    }


    canPass(tank, orientation) {
        if (this.collideWithTanks(tank.item, orientation)) {
            return false;
        }

        const control = super.generateNewControl(this.room, tank.item, orientation, 1);
        return !(control.action === 0 || control.cache);
    }

    collideWithTanks(tank, orientation) {
        for (let [, v] of this.tanks) {
            const target = v.item;
            if (target.id === tank.id) {
                continue;
            }
            const distance = Common.distance(target.x, target.y, tank.x, tank.y);
            if (distance <= Resource.getUnitSize()) {
                switch (orientation) {
                    case 0:
                        if (tank.y > target.y) {
                            return true;
                        }
                        break;
                    case 1:
                        if (tank.y < target.y) {
                            return true;
                        }
                        break;
                    case 2:
                        if (tank.x > target.x) {
                            return true;
                        }
                        break;
                    case 3:
                        if (tank.x < target.x) {
                            return true;
                        }
                        break;
                }
            }
        }
        return false;
    }

    getBack(orientation) {
        switch (orientation) {
            case 0:
                return 1;
            case 1:
                return 0;
            case 2:
                return 3;
            case 3:
                return 2;
            default:
                return orientation;
        }
    }

    updateTimeEvents() {
        for (let i = 0; i < this.timeEvents.length; ++i) {
            const event = this.timeEvents[i];
            if (event.timeout > 0) {
                --event.timeout;
                continue;
            }

            event.callback();
            this.timeEvents.splice(i, 1);
            --i;
        }
    }

    addTimeEvent(timeout, callback) {
        const event = {};
        event.timeout = timeout;
        event.callback = callback;
        this.timeEvents.push(event);
    }

    createTank(startPosList, id, typeId, teamId) {
        const thisEngine = this;
        const startPos = startPosList[Math.floor(Math.random() * startPosList.length)];
        const point = Common.getPositionFromId(startPos);
        thisEngine.tanks.set(id, {
            id: id,
            shieldTimeout: 60 * 3,
            typeId: typeId,
            bulletCount: thisEngine.tankTypes[typeId].ammoMaxCount,
            bulletReloadTime: thisEngine.tankTypes[typeId].ammoReloadTime
        });
        Resource.getRoot().processSocketMessage({
            messageType: "TANKS",
            message: [{
                id: id,
                typeId: typeId,
                teamId: teamId,
                hasShield: true,
                x: point.x,
                y: point.y,
                orientation: 0,
                action: 0,
                speed: thisEngine.tankTypes[typeId].speed
            }]
        });
        thisEngine.tanks.get(id).item = thisEngine.room.items.get(id);
    }

    createPlayerTank() {
        const thisEngine = this;
        this.addTimeEvent(Math.random() * 60 * 3 + 60, function () {
            --thisEngine.room.roomInfo.playerLife;
            thisEngine.createTank(this.mapInfo.playerStartPos,
                Resource.getUser().userId,
                AiEngine.playerTypeId,
                1);
        });
    }

    createComputerTank() {
        if (this.mapInfo.computerTypeCountList.length === 0) {
            return;
        }

        const typeCount = this.mapInfo.computerTypeCountList[0];
        const typeId = typeCount.key;
        --typeCount.value;
        if (typeCount.value <= 0) {
            this.mapInfo.computerTypeCountList.splice(0, 1);
        }

        const thisEngine = this;
        this.addTimeEvent(Math.random() * 60 * 3 + 60, function () {
            --thisEngine.room.roomInfo.computerLife;
            thisEngine.createTank(this.mapInfo.computerStartPos,
                Resource.generateClientId(),
                typeId,
                2);
        });
    }

    processControlEvent(control) {
        super.processControlEvent(control);
        switch (control) {
            case "FIRE":
                this.tankFire(Resource.getUser().userId);
                break;
            default:
                break;
        }
    }

    tankFire(tankId) {
        if (!this.tanks.has(tankId)) {
            return;
        }

        const tank = this.tanks.get(tankId);
        if (tank.bulletCount <= 0) {
            return;
        }

        if (tank.bulletReloadTime > 0) {
            return;
        }

        const tankType = this.tankTypes[tank.typeId];
        --tank.bulletCount;
        tank.bulletReloadTime = tankType.ammoReloadTime;

        const pos = this.generateBulletPos(tank);
        const id = Resource.generateClientId();
        this.bullets.set(id, {
            id: id,
            tankId: tank.item.id,
            teamId: tank.item.teamId,
            lifeTime: tankType.ammoMaxLifeTime,
            brokenIron: tankType.brokenIron
        });
        Resource.getRoot().processSocketMessage({
            messageType: "BULLET",
            message: [{
                id: id,
                x: pos.x,
                y: pos.y,
                orientation: tank.item.orientation,
                speed: tankType.ammoSpeed,
            }]
        });
        this.bullets.get(id).item = this.room.items.get(id);
    }

    generateBulletPos(tank) {
        let x = tank.item.x;
        let y = tank.item.y;
        const half = Resource.getUnitSize() / 2;
        switch (tank.item.orientation) {
            case 0:
                y -= half;
                break;
            case 1:
                y += half;
                break;
            case 2:
                x -= half;
                break;
            case 3:
                x += half;
                break;
        }
        return {x: x, y: y};
    }

}