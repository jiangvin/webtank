/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/27
 */

export default class ControlUnit {
    constructor(id, leftTop, rightBottom, callBack) {
        this.id = id;
        this.leftTop = leftTop;
        this.rightBottom = rightBottom;
        this.callBack = callBack;
    }

    process(point) {
        if (point.x >= this.leftTop.x &&
            point.x <= this.rightBottom.x &&
            point.y >= this.leftTop.y &&
            point.y <= this.rightBottom.y) {
            this.callBack();
            return true;
        } else {
            return false;
        }
    }
}