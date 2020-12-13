/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/27
 */

export default class Status {
    constructor() {
        this.value = Status.statusPause();
        this.ack = false;
    }

    static setStatus(value) {
        Status.instance.value = value;
    }

    static isGaming() {
        return Status.getValue() !== Status.statusPause();
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

    static statusPauseRed() {
        return "pauseRed";
    }

    static statusPauseBlue() {
        return "pauseBlue";
    }

    static setAck(ack) {
        Status.instance.ack = ack;
    }

    static getAck() {
        return Status.instance.ack;
    }
}
Status.instance = new Status();