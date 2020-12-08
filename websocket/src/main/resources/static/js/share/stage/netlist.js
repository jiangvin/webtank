import Stage from "./stage.js";
import Common from "../tool/common.js";

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/7
 */

export default class NetList extends Stage {
    constructor() {
        super();

        //背景
        this.createFullScreenItem("net_background");

        this.createControl({
            leftTop: {
                x: 1784,
                y: 32
            },
            size: {
                w: 86,
                h: 96
            },
            callBack: function () {
                Common.gotoStage("menu");
            }
        });
        this.createControl({
            leftTop: {
                x: 1520,
                y: 920
            },
            size: {
                w: 255,
                h: 80
            },
            callBack: function () {
                Common.nextStage();
            }
        });
    }

    getId() {
        return "net_list";
    }
}