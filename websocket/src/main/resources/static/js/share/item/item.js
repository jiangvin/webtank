/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/26
 */

import Resource from "../tool/resource.js";

export default class Item {
    constructor(options) {
        this.id = Resource.generateClientId();

        //所属场景
        this.stage = null;

        //触控事件
        this.controlUnit = null;

        for (let key in options) {
            this[key] = options[key];
        }
    }

    update() {
    }

    draw(ctx) {
    }

}