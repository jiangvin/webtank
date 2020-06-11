/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/27
 */

export default class Status {
    constructor() {
        this.value = Status.statusPause();
        this.message = null;
    }

    static setStatus(value, message) {
        if (value !== null) {
            Status.instance.value = value;
        }
        if (message !== undefined) {
            Status.instance.message = message;
        }
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
Status.instance = new Status();