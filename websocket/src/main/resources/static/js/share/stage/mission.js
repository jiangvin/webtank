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

        //难度选择
        const thisMission = this;
        this.createItem({
            draw: function (ctx) {
                ctx.drawResourceCenter(
                    thisMission.roomInfo.hardMode ? "mission_hard" : "mission_easy",
                    Resource.width() / 2, Resource.height() * .54,
                    Resource.width() * .92, Resource.height() * .84);
            }
        });
        this.initControlEvent();
    }

    initControlEvent() {
        const thisMission = this;
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

        this.createControl({
            leftTop: {
                x: Resource.width() * .05,
                y: Resource.height() * .13
            },
            size: {
                w: Resource.width() * .1,
                h: Resource.height() * .046
            },
            callBack: function () {
                thisMission.roomInfo.hardMode = false;
            }
        });
        this.createControl({
            leftTop: {
                x: Resource.width() * .175,
                y: Resource.height() * .13
            },
            size: {
                w: Resource.width() * .1,
                h: Resource.height() * .046
            },
            callBack: function () {
                thisMission.roomInfo.hardMode = true;
            }
        });
    }

    getId() {
        return "mission";
    }

    init(roomInfo) {
        this.roomInfo = roomInfo;
    }
}