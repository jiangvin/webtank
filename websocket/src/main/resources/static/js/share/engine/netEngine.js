/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/28
 */
import Engine from "./engine.js";
import Common from "../tool/common.js";

export default class NetEngine extends Engine {
    constructor(room) {
        super(room);
        this.setUserId(function () {

        })
    }

    setUserId(callback) {
        Common.getRequest("/multiplePlayers/getUserId", function (userId) {
            Resource.setUserId(userId);
            callback();
        })
    }
}