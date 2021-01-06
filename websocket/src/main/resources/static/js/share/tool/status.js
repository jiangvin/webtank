/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/27
 */
import Resource from "./resource.js";

export default class Status {
    constructor() {
        this.value = Status.statusPause();
        this.ack = false;
    }

    drawParseTip() {
        const stage = Resource.getRoot().currentStage();
        const size = {
            w: 780,
            h: 110
        };

        stage.createItem({
            id: "net_parse_tip",
            draw: ctx => {
                ctx.fillStyle = '#000';
                ctx.globalAlpha = 0.6;
                ctx.displayFillRoundRect(
                    Resource.formatWidth() / 2 - size.w / 2,
                    Resource.formatHeight() / 2 - size.h / 2,
                    size.w, size.h, 20);
                ctx.globalAlpha = 1;

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#FFF';
                ctx.displayText("网络断开,尝试重新连接中...",
                    Resource.formatWidth() / 2,
                    Resource.formatHeight() / 2,
                    48);
            }
        })
    }

    clearParseTip() {
        const stage = Resource.getRoot().currentStage();
        stage.removeItemFromId("net_parse_tip");
    }

    static setStatus(value) {
        this.prepareBeforeSet(value);
        Status.instance.value = value;
    }

    static prepareBeforeSet(newValue) {
        if (this.getValue() === this.statusPauseForNet()) {
            this.instance.clearParseTip();
        }
        if (newValue === this.statusPauseForNet()) {
            this.instance.drawParseTip();
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