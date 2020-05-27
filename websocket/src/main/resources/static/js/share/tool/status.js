/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/27
 */

export default class Status {
    static instance = new Status();

    constructor() {
        this.value = Status.statusNormal();
        this.message = null;
        this.showMask = false;
    }

    static setStatus(value, message, showMask) {
        if (showMask === undefined) {
            showMask = !!message;
        }
        Status.instance.value = value;
        Status.instance.message = message;
        Status.instance.showMask = showMask;
    }

    static getShowMask() {
        return Status.instance.showMask;
    }

    static getMessage() {
        return Status.instance.message;
    }

    static statusNormal() {
        return "normal";
    }

    static statusPause() {
        return "pause";
    }
}