/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/26
 */

export default class User {
    constructor() {
        this.userId = "";
        this.coin = 0;
        this.originalUserId = null;
        this.deviceId = null;
        this.deviceName = null;
        this.redStarExpired = null;
        this.ghostExpired = null;
        this.clockExpired = null;

        this.tankType = "tank01";
        this.tankTypeExpired = null;
    }

    setData(data) {
        this.setUserId(data.username);
        this.coin = data.coin;
        this.redStarExpired = data.redStarExpired;
        this.ghostExpired = data.ghostExpired;
        this.clockExpired = data.clockExpired;
        this.tankType = data.tankType;
        this.tankTypeExpired = data.tankTypeExpired;
    }

    setUserId(userId) {
        this.userId = userId;
        if (!this.originalUserId) {
            this.originalUserId = userId;
        }
    }

    hasRedStar() {
        return this.redStarExpired && this.redStarExpired > new Date().getTime();
    }

    hasGhost() {
        return this.ghostExpired && this.ghostExpired > new Date().getTime();
    }

    hasClock() {
        return this.clockExpired && this.clockExpired > new Date().getTime();
    }

    getTankType() {
        if (!this.tankTypeExpired || this.tankTypeExpired < new Date().getTime()) {
            return "tank01";
        }
        return this.tankType;
    }
}