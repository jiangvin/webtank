/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/27
 */

export default class Status {
    static instance = new Status();

    constructor() {
        this.value = Status.statusPause();
        this.message = null;
        this.showMask = false;
    }

    static setStatus(value, message, showMask) {
        if (value !== null) {
            Status.instance.value = value;
        }
        if (message !== undefined) {
            Status.instance.message = message;
        }
        if (showMask !== undefined) {
            Status.instance.showMask = showMask;
        }
    }

    static getShowMask() {
        return Status.instance.showMask;
    }

    static getMessage() {
        return Status.instance.message;
    }

    static getValue() {
        return Status.instance.value;
    }

    static statusNormal() {
        return "normal";
    }

    static statusPause() {
        return "pause";
    }
}