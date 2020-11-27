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
                ctx.displayCenter(
                    thisMission.roomInfo.hardMode ? "mission_hard" : "mission_easy",
                    Resource.width() / 2, Resource.height() * .54,
                    Resource.width() * .92, Resource.height() * .84);
            }
        });

        this.createMapSelected();

        this.initControlEvent();
    }

    createMapSelected() {
        const mapMaxId = 4;
        const thisMission = this;
        const rectSelected = {
            w: Resource.width() * .2,
            h: Resource.height() * .12,
            x: Resource.width() * .043,
            y: Resource.height() * .25,
        };
        const rect = {
            w: rectSelected.w * .85,
            h: rectSelected.h * .93
        };
        rect.x = rectSelected.x + (rectSelected.w - rect.w) * .91;
        rect.y = rectSelected.y + (rectSelected.h - rect.h) / 2;

        const map = {
            w: rect.w * .92,
            h: rect.h * .92
        };
        map.x = rect.x + (rect.w - map.w) / 2;
        map.y = rect.y + (rect.h - map.h) / 2;


        this.createItem({
            draw: function (ctx) {
                for (let i = 0; i < mapMaxId; ++i) {
                    //选择框
                    if (i === thisMission.roomInfo.mapId - 1) {
                        ctx.drawResourceLeft("mission_map_rect_selected",
                            rectSelected.x,
                            rectSelected.y + i * (rectSelected.h * 1.1),
                            rectSelected.w,
                            rectSelected.h)
                    } else {
                        ctx.drawResourceLeft("mission_map_rect",
                            rect.x,
                            rect.y + i * (rectSelected.h * 1.1),
                            rect.w,
                            rect.h)
                    }

                    //底图
                    ctx.drawResourceLeft("mission_map",
                        map.x,
                        map.y + i * (rectSelected.h * 1.1),
                        map.w,
                        map.h)
                }
            }
        });

        //控制单元
        for (let i = 0; i < mapMaxId; ++i) {
            this.createControl({
                leftTop: {
                    x: Resource.width() * .043 + (rectSelected.w - rect.w),
                    y: Resource.height() * .25 + i * (rectSelected.h * 1.1)
                },
                size: rect,
                callBack: function () {
                    thisMission.roomInfo.mapId = i + 1;
                }
            })
        }
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