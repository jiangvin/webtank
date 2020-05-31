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
         * @type {{ammoMaxCount,ammoReloadTime}}
         */
        thisEngine.tankTypes = {};

        /**
         * @type {{playerStartPos}}
         */
        thisEngine.mapInfo = {};
        thisEngine.timeEvents = [];

        thisEngine.tanks = new Map();

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
        this.updateTanks();
        super.update();
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

        
    }
}