/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/26
 */

export default class User {
    constructor() {
        this.userId = null;
        this.originalUserId = null;
        this.deviceId = null;
        this.deviceName = null;
        this.coin = 0;
        this.redStarExpired = null;
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
}