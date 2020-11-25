/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/11/25
 */

import Stage from "./stage.js";
import Resource from "../tool/resource.js";
import Common from "../tool/common.js";

export default class Mission extends Stage {
    constructor() {
        super();

        this.createFullScreenItem("mission_background");
        this.initControlEvent();
    }

    initControlEvent() {
        this.createControl({
            leftTop: {
                x: Resource.width() * .93,
                y: Resource.height() * .03
            },
            size: {
                w: Resource.width() * .045,
                h: Resource.height() * .09
            },
            callBack: function () {
                Common.gotoStage("menu");
            }
        });
    }

    getId() {
        return "mission";
    }
}