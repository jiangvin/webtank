/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/27
 */

import Sound from "../tool/sound.js";
import Resource from "../tool/resource.js";

export default class ControlUnit {
    constructor(id, leftTop, rightBottom, callBack) {
        this.id = id;
        this.leftTop = leftTop;
        this.rightBottom = rightBottom;
        this.callBack = callBack;
    }

    process(point) {
        const offset = Resource.getOffset();
        if (point.x >= this.leftTop.x + offset.x &&
            point.x <= this.rightBottom.x + offset.x &&
            point.y >= this.leftTop.y + offset.y &&
            point.y <= this.rightBottom.y + offset.y) {
            Sound.click();
            this.callBack();
            return true;
        } else {
            return false;
        }
    }
}