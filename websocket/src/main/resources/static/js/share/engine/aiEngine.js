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

    constructor(room) {
        super(room);

        const thisEngine = this;
        thisEngine.playerLifeCount = 10;

        /**
         * @type {{ammoMaxCount,ammoReloadTime,ammoSpeed,ammoMaxLifeTime}}
         */
        thisEngine.tankTypes = {};

        /**
         * @type {{playerStartPos}}
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
            callback();
        });
    }

    update() {
        this.updateTimeEvents();
        this.updateBullets();
        this.updateTanks();
        super.update();
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
            }
        })
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
                return true;
            case 7:
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

    updateTanks() {
        const thisEngine = this;
        this.tanks.forEach(function (tank) {
            if (!tank.item) {
                tank.item = thisEngine.room.items.get(tank.id);
            }
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
        })
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

    createPlayerTank() {
        const thisEngine = this;
        this.addTimeEvent(Math.random() * 60 * 3 + 60, function () {
            const startPosList = thisEngine.mapInfo.playerStartPos;
            const startPos = startPosList[Math.floor(Math.random() * startPosList.length)];
            const point = Common.getPositionFromId(startPos);
            thisEngine.tanks.set(Resource.getUser().userId, {
                id: Resource.getUser().userId,
                shieldTimeout: 60 * 3,
                typeId: AiEngine.playerTypeId,
                bulletCount: thisEngine.tankTypes[AiEngine.playerTypeId].ammoMaxCount,
                bulletReloadTime: thisEngine.tankTypes[AiEngine.playerTypeId].ammoReloadTime
            });
            Resource.getRoot().processSocketMessage({
                messageType: "TANKS",
                message: [{
                    id: Resource.getUser().userId,
                    typeId: AiEngine.playerTypeId,
                    teamId: 1,
                    hasShield: true,
                    x: point.x,
                    y: point.y,
                    orientation: 0,
                    action: 0,
                    speed: thisEngine.tankTypes[AiEngine.playerTypeId].speed
                }]
            });
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