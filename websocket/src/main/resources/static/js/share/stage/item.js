/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/26
 */

import Resource from "../tool/resource.js";

export default class Item {
    constructor(options) {
        this.id = Resource.generateClientId();
        this.x = 0;
        this.y = 0;
        this.z = 0;

        for (let key in options) {
            this[key] = options[key];
        }
    }

    update() {

    }

    draw(ctx) {

    }
}