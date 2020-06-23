
/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/27
 */

import Resource from "./resource.js";

export default class Status {
    constructor() {
        this.value = Status.statusPause();
        this.message = null;
        this.height = 0;
    }

    static setStatus(value, message, height) {
        if (value !== null) {
            Status.instance.value = value;
        }
        if (message !== undefined) {
            Status.instance.message = message;
        }

        if (height) {
            Status.instance.height = height;
        } else {
            Status.instance.height = Resource.height() * .4;
        }
    }

    static isGaming() {
        return Status.getValue() !== Status.statusPause();
    }

    static getMessage() {
        return Status.instance.message;
    }

    static getValue() {
        return Status.instance.value;
    }

    static getHeight() {
        return Status.instance.height;
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
}
Status.instance = new Status();