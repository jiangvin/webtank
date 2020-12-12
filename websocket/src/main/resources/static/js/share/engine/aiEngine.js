/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/28
 */
import Engine from "./engine.js";
import Common from "../tool/common.js";
import Resource from "../tool/resource.js";
import Status from "../tool/status.js";
import Button from "../item/button.js";
import Sound from "../tool/sound.js";

export default class AiEngine extends Engine {
    constructor(room) {
        super(room);

        const thisEngine = this;

        thisEngine.score = 0;
        thisEngine.stageStartTime = 0;

        thisEngine.playerLifeCount = 0;
        thisEngine.computerLifeCount = 0;

        //整理随机道具池
        thisEngine.itemTypes = ["star", "shield", "life", "king", "bullet"];
        if (Resource.getUser().hasRedStar()) {
            thisEngine.itemTypes[thisEngine.itemTypes.length] = "red_star";
        }
        if (Resource.getUser().hasGhost()) {
            thisEngine.itemTypes[thisEngine.itemTypes.length] = "ghost";
        }
        if (Resource.getUser().hasClock()) {
            thisEngine.itemTypes[thisEngine.itemTypes.length] = "clock";
        }

        thisEngine.maxSubId = 1;
        Common.getRequest("/singlePlayer/getMaxSubId?id=" + thisEngine.room.roomInfo.mapId, function (data) {
            thisEngine.maxSubId = data;
        });

        /**
         * @type {{ammoMaxCount,ammoReloadTime,ammoSpeed,ammoMaxLifeTime,downId,upId}}
         */
        thisEngine.tankTypes = {};

        /**
         * @type {{playerStartPos,computerStartPos,computerStartCount,computerTypeCountList,maxGridX,maxGridY}}
         */
        thisEngine.mapInfo = {};

        thisEngine.tanks = new Map();
        thisEngine.bullets = new Map();
        thisEngine.items = new Map();

        Common.getRequest("/singlePlayer/getTankTypes", function (data) {
            thisEngine.tankTypes = data;
            thisEngine.initStage();
        })
    }

    initStage() {
        const thisEngine = this;
        thisEngine.loadMapDetail(function () {
            Resource.getRoot().processSocketMessage({
                messageType: "MAP",
                message: thisEngine.mapInfo
            });

            //create tanks
            thisEngine.createPlayerTank();
            for (let i = 0; i < thisEngine.mapInfo.computerStartCount; ++i) {
                thisEngine.createComputerTank();
            }

            //create item
            thisEngine.createGameItem();

            Resource.getRoot().processSocketMessage({
                messageType: "SERVER_READY"
            });
            thisEngine.stageStartTime = Date.now();
        })
    }

    createGameItem() {
        const thisEngine = this;
        thisEngine.createItemTimeout = 15;

        const createItemEvent = function () {
            //重复创建道具事件
            thisEngine.createItemTimeout += 5;
            thisEngine.addTimeEvent(thisEngine.createItemTimeout * 60, function () {
                createItemEvent();
            });

            if (thisEngine.items.size >= AiEngine.maxItemLimit) {
                return;
            }
            const index = Math.floor(Math.random() * thisEngine.itemTypes.length);
            const typeId = thisEngine.itemTypes[index];
            const id = Resource.generateClientId();
            const size = Resource.getUnitSize();
            for (let i = 0; i < 10; ++i) {
                const gridX = Math.floor(Math.random() * thisEngine.mapInfo.maxGridX);
                const gridY = Math.floor(Math.random() * thisEngine.mapInfo.maxGridY);
                const key = gridX + '_' + gridY;
                if (thisEngine.room.items.has(key)) {
                    continue;
                }

                Resource.getRoot().processSocketMessage({
                    messageType: "ITEM",
                    message: [{
                        id: id,
                        x: gridX * size + size / 2,
                        y: gridY * size + size / 2,
                        typeId: typeId
                    }]
                });
                thisEngine.items.set(id, thisEngine.room.items.get(id));
                break;
            }
        };

        thisEngine.addTimeEvent(thisEngine.createItemTimeout * 60, function () {
            createItemEvent();
        });
    };

    loadMapDetail(callback) {
        const thisEngine = this;
        Common.getRequest("/singlePlayer/getMapFromId?id=" + this.room.roomInfo.mapId +
            "&subId=" + this.room.roomInfo.subId, function (data) {
            thisEngine.mapInfo = data;

            //如果playerLife有值，则以playerLife为准，否则以地图数据为准
            if (thisEngine.playerLifeCount) {
                thisEngine.mapInfo.playerLife = thisEngine.playerLifeCount;
            } else {
                thisEngine.playerLifeCount = thisEngine.mapInfo.playerLife;
            }
            thisEngine.computerLifeCount = thisEngine.mapInfo.computerLife;

            callback();
        });
    }

    update() {
        super.update();

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
                bullet.item.x > thisEngine.mapInfo.width ||
                bullet.item.y > thisEngine.mapInfo.height) {
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
                if (!tank.item.hasShield && !this.downLevel(tank)) {
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
                if (bullet.teamId === 2) {
                    Resource.getRoot().processSocketMessage({
                        messageType: "REMOVE_MAP",
                        message: mapItemId
                    });
                    this.processGameOver(false);
                }
                return true;
        }
    }

    processGameOver(win) {
        const thisEngine = this;
        //计算胜利分数
        if (win) {
            const gameSeconds = (new Date() - thisEngine.stageStartTime) / 1000;
            //困难模式加权
            const hardMode = thisEngine.room.roomInfo.hardMode ? AiEngine.scoreHardMode : 0;

            let winScore = Math.floor(AiEngine.scoreWin + hardMode - gameSeconds);
            if (winScore < 0) {
                winScore = 0;
            }
            thisEngine.score += winScore;
            Common.getRequest("/singlePlayer/getRank?score=" + thisEngine.score, function (rank) {
                if (thisEngine.room.roomInfo.subId >= thisEngine.maxSubId) {
                    thisEngine.room.gameStatus({
                        message: "恭喜全部通关",
                        type: "WIN",
                        score: thisEngine.score,
                        rank: rank
                    });
                    thisEngine.saveRank();
                    thisEngine.saveStage();
                    return;
                }

                thisEngine.room.gameStatus({
                    message: "恭喜通关",
                    type: "PAUSE",
                    score: thisEngine.score,
                    rank: rank
                });

                const next = new Button("进入下一关", Resource.width() * 0.5, Resource.height() * 0.68, function () {
                    //进入下一关
                    ++thisEngine.room.roomInfo.subId;
                    thisEngine.startGame();
                });
                thisEngine.room.addItem(next);
            });
        } else {
            Common.getRequest("/singlePlayer/getRank?score=" + thisEngine.score, function (rank) {
                thisEngine.room.gameStatus({
                    message: "游戏失败",
                    type: "LOSE",
                    score: thisEngine.score,
                    rank: rank
                });
                thisEngine.saveRank();
            });
        }
    }

    saveStage() {
        const thisEngine = this;
        const request = {
            userId: Resource.getUser().deviceId,
            stage: thisEngine.room.roomInfo.mapId,
            hardStage: thisEngine.room.roomInfo.mapId
        };

        if (thisEngine.room.roomInfo.hardMode) {
            ++request.hardStage;
        } else {
            ++request.stage;
        }

        Common.postEncrypt("/singlePlayer/saveStage", request, data => {
            Resource.setUser(data);
        });
    }

    saveRank() {
        const thisEngine = this;
        Common.getRequest("/user/getToken", function (token) {
            Common.postEncrypt("/singlePlayer/saveRank?username=" + Resource.getUser().userId,
                {
                    score: thisEngine.score,
                    userId: Resource.getUser().deviceId,
                    token: token
                });
        });
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

        if (tank.item.teamId === 1) {
            this.score += AiEngine.scorePlayerBoom;
            --this.playerLifeCount;
            if (this.playerLifeCount === 0) {
                this.processGameOver(false);
            } else {
                this.createPlayerTank();
            }
            return;
        }

        this.score += AiEngine.scoreComBoom;
        --this.computerLifeCount;
        if (this.computerLifeCount === 0) {
            this.processGameOver(true);
        } else {
            this.createComputerTank();
        }
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

            thisEngine.catchItem(tank);

            if (tank.item.teamId !== 2) {
                return;
            }

            //有时钟道具，所有坦克全部暂停
            if (Status.getValue() === Status.statusPauseBlue()) {
                return;
            }

            thisEngine.updateTankAi(tank);
        })
    }

    catchItem(tank) {
        if (tank.item.teamId !== 1 && !this.room.roomInfo.hardMode) {
            return;
        }

        for (let [k, v] of this.items) {
            const item = v;

            const distance = Common.distance(tank.item.x, tank.item.y, item.x, item.y);
            if (distance >= Resource.getUnitSize()) {
                continue;
            }

            switch (item.typeId) {
                case "star":
                    if (this.upLevel(tank)) {
                        this.removeGameItem(k);
                    }
                    break;
                case "red_star":
                    if (this.upToTopLevel(tank)) {
                        this.removeGameItem(k);
                    }
                    break;
                case "shield":
                    tank.shieldTimeout += 20 * 60;
                    tank.item.hasShield = true;
                    this.removeGameItem(k);
                    break;
                case "life":
                    this.addTankLife(tank);
                    this.removeGameItem(k);
                    break;
                case "king":
                    this.createKingShield(tank.item.teamId);
                    this.removeGameItem(k);
                    break;
                case "bullet":
                    tank.bulletCount += 1;
                    tank.maxBulletCount += 1;
                    this.removeGameItem(k);
                    break;
                case "ghost":
                    if (!tank.item.hasGhost) {
                        tank.item.hasGhost = true;
                        this.removeGameItem(k);
                    }
                    break;
                case "clock":
                    this.createClock(tank.item.teamId);
                    this.removeGameItem(k);
                    break;
            }
        }
    }

    addTankLife(tank) {
        if (tank.item.teamId === 1) {
            ++this.playerLifeCount;
            ++this.room.roomInfo.playerLife;
            return;
        }

        ++this.computerLifeCount;
        ++this.room.roomInfo.computerLife;

        //添加类型，若存在则添加第一个类型的数量，若不存在则新增
        if (this.mapInfo.computerTypeCountList.length !== 0) {
            ++this.mapInfo.computerTypeCountList[0].value;
        } else {
            this.mapInfo.computerTypeCountList[0] = {
                key: tank.typeId,
                value: 1
            }
        }
    }

    createClock(teamId) {
        if (teamId === 1) {
            Status.setStatus(Status.statusPauseBlue());
        } else {
            Status.setStatus(Status.statusPauseRed());
        }
        this.tanks.forEach(function (tank) {
            if (tank.item.teamId === teamId) {
                return;
            }

            tank.item.action = 0;
        });

        //15秒后变回来
        this.addTimeEvent(15 * 60, function () {
            Status.setStatus(Status.statusNormal());
        });
    }

    createKingShield(teamId) {
        const thisEngine = this;
        const kingKeys = [];
        this.mapInfo.itemList.forEach(function (item) {
            if (item.typeId === "6") {
                kingKeys[kingKeys.length] = item.id;
            }
        });
        const changeKeys = [];
        kingKeys.forEach(function (key) {
            const infos = key.split("_");
            const point = {};
            point.x = parseInt(infos[0]);
            point.y = parseInt(infos[1]);
            for (let x = point.x - 1; x <= point.x + 1; ++x) {
                for (let y = point.y - 1; y <= point.y + 1; ++y) {
                    if (x < 0 || x >= thisEngine.mapInfo.maxGridX) {
                        continue;
                    }
                    if (y < 0 || y >= thisEngine.mapInfo.maxGridY) {
                        continue;
                    }

                    const changeKey = x + "_" + y;
                    if (thisEngine.room.items.has(changeKey)) {
                        const item = thisEngine.room.items.get(changeKey);
                        if (item.typeId === 0 || item.typeId === 1) {
                            changeKeys[changeKeys.length] = changeKey;
                        }
                    } else {
                        changeKeys[changeKeys.length] = changeKey;
                    }
                }
            }
        });

        if (changeKeys.length === 0) {
            return;
        }

        //若是玩家则替换成铁，否则删除周围的保护
        if (teamId === 1) {
            //替换成铁
            changeKeys.forEach(function (key) {
                thisEngine.room.createOrUpdateMapItem({
                    id: key,
                    typeId: 2
                });
            });

            //换回来
            thisEngine.addTimeEvent(30 * 60, function () {
                changeKeys.forEach(function (key) {
                    if (thisEngine.room.items.has(key)) {
                        thisEngine.room.createOrUpdateMapItem({
                            id: key,
                            typeId: 0
                        });
                    }
                });
            });
        } else {
            //删除保护
            changeKeys.forEach(function (key) {
                Resource.getRoot().processSocketMessage({
                    messageType: "REMOVE_MAP",
                    message: key
                });
            });
        }
    }

    removeGameItem(id) {
        this.items.delete(id);
        this.room.removeGameItem(id);
    }

    upLevel(tank) {
        if (!this.tankTypes[tank.typeId].upId) {
            return false;
        }
        this.changeType(tank, this.tankTypes[tank.typeId].upId);
        return true;
    }

    downLevel(tank) {
        if (!this.tankTypes[tank.typeId].downId) {
            return false;
        }
        this.changeType(tank, this.tankTypes[tank.typeId].downId);
        return true;
    }

    upToTopLevel(tank) {
        if (!this.tankTypes[tank.typeId].upId) {
            return false;
        }
        let typeId = tank.typeId;
        while (this.tankTypes[typeId].upId) {
            typeId = this.tankTypes[typeId].upId;
        }
        this.changeType(tank, typeId);
        return true;
    }

    changeType(tank, typeId) {
        const oldType = this.tankTypes[tank.typeId];
        const newType = this.tankTypes[typeId];

        tank.bulletReloadTime += newType.ammoReloadTime - oldType.ammoReloadTime;
        tank.bulletCount += newType.ammoMaxCount - oldType.ammoMaxCount;
        tank.typeId = typeId;

        Resource.getRoot().processSocketMessage({
            messageType: "TANKS",
            message: [{
                id: tank.id,
                typeId: tank.typeId,
                hasShield: tank.item.hasShield,
                x: tank.item.x,
                y: tank.item.y,
                orientation: tank.item.orientation,
                action: tank.item.action,
                speed: newType.speed
            }]
        });
    }

    updateTankAi(tank) {
        if (tank.bulletReloadTime <= 0 && tank.bulletCount !== 0) {
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
        if (!tank.item.hasGhost && this.collideWithTanks(tank.item, orientation)) {
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

    createTank(startPosList, id, typeId, teamId, hasShield) {
        const thisEngine = this;
        const startPos = startPosList[Math.floor(Math.random() * startPosList.length)];
        const point = Common.getPositionFromId(startPos);
        thisEngine.tanks.set(id, {
            id: id,
            shieldTimeout: hasShield ? 60 * 3 : 0,
            typeId: typeId,
            maxBulletCount: thisEngine.tankTypes[typeId].ammoMaxCount,
            bulletCount: thisEngine.tankTypes[typeId].ammoMaxCount,
            bulletReloadTime: thisEngine.tankTypes[typeId].ammoReloadTime
        });
        Resource.getRoot().processSocketMessage({
            messageType: "TANKS",
            message: [{
                id: id,
                typeId: typeId,
                teamId: teamId,
                hasShield: hasShield,
                x: point.x,
                y: point.y,
                orientation: Math.floor(Math.random() * 4),
                action: 0,
                speed: thisEngine.tankTypes[typeId].speed
            }]
        });
        thisEngine.tanks.get(id).item = thisEngine.room.items.get(id);
    }

    createPlayerTank() {
        //获取类型
        let tankType;
        if (this.playerTankStatus) {
            tankType = this.playerTankStatus.typeId;
        } else {
            tankType = Resource.getUser().getTankType();
        }

        const id = Resource.getUser().userId;
        this.addTimeEvent(Math.random() * 60 * 3 + 60, () => {
            --this.room.roomInfo.playerLife;
            this.createTank(this.mapInfo.playerStartPos,
                id,
                tankType,
                1,
                true);

            //复制并恢复玩家保存的类型
            if (this.playerTankStatus) {
                this.tanks.get(id).bulletCount = this.playerTankStatus.maxBulletCount;
                this.tanks.get(id).maxBulletCount = this.playerTankStatus.maxBulletCount;
                this.tanks.get(id).item.hasGhost = this.playerTankStatus.item.hasGhost;
                this.playerTankStatus = null;
            }
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
            thisEngine.createTank(thisEngine.mapInfo.computerStartPos,
                Resource.generateClientId(),
                typeId,
                2, false);
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

        if (Status.getValue() === Status.statusPauseRed() && tank.item.teamId === 1) {
            return;
        }

        if (Status.getValue() === Status.statusPauseBlue() && tank.item.teamId === 2) {
            return;
        }

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
                teamId: tank.item.teamId
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

    again() {
        //需在暂停的时候触发
        if (Status.isGaming()) {
            return;
        }

        const thisEngine = this;
        Common.postEncrypt("/shop/buyWithCoin", {
            userId: Resource.getUser().deviceId,
            buyType: "AGAIN_FOR_SINGLE"
        }, function (data) {
            Resource.setUser(data);
            Common.addMessage("续关成功!", '#FF0');

            //重置初始生命
            thisEngine.playerLifeCount = 0;

            thisEngine.startGame();
        });
    }

    startGame() {
        //关卡信息
        Status.setStatus(null, this.room.generateMaskInfo());

        //保存坦克状态,用于下一关使用
        this.playerTankStatus = this.tanks.get(Resource.getUser().userId);

        //清空场景
        this.events = [];
        this.tanks.clear();
        this.bullets.clear();
        this.items.clear();
        this.room.clear();

        //进入下一关
        this.initStage();
        Sound.bgm();
    }
}
AiEngine.keepGoingRate = 120;
AiEngine.keepTryRate = 30;
AiEngine.maxItemLimit = 3;

/**
 * 需要和服务器同步
 */
AiEngine.scoreComBoom = 10;
AiEngine.scorePlayerBoom = -30;
AiEngine.scoreWin = 500;
AiEngine.scoreHardMode = 100;