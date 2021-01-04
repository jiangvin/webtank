import Tip from "../item/tip.js";

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/27
 */

export default class Status {
    constructor() {
        this.value = Status.statusPause();
        this.ack = false;
        this.parseForNetTip = null;
    }

    static setStatus(value) {
        this.prepareBeforeSet(value);
        Status.instance.value = value;
    }

    static prepareBeforeSet(newValue) {
        if (this.getValue() === this.statusPauseForNet()) {
            this.instance.parseForNetTip.close();
        }
        if (newValue === this.statusPauseForNet()) {
            this.instance.parseForNetTip = new Tip(null, "网络断开,尝试重新连接中...", 60 * 1800);
        }
    }

    static isGaming() {
        return Status.getValue() !== Status.statusPause() && Status.getValue() !== Status.statusPauseForNet();
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

    static statusPauseForNet() {
        return "pauseForNet";
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