/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/11/25
 */

import Stage from "./stage.js";
import Common from "../tool/common.js";
import Resource from "../tool/resource.js";

export default class Mission extends Stage {
    constructor() {
        super();

        this.createFullScreenItem("mission_background");

        //难度选择
        const thisMission = this;
        this.createItem({
            draw: function (ctx) {
                ctx.displayCenterRate(
                    thisMission.roomInfo.hardMode ? "mission_hard" : "mission_easy",
                    .5, .54,
                    .92, .84);
            }
        });

        this.createMapSelected();

        this.initControlEvent();
    }

    createMapSelected() {
        const mapMaxId = 4;
        const thisMission = this;
        const rectSelected = {
            w: 192,
            h: 64,
            x: 41,
            y: 135,
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
                        ctx.displayTopLeft("mission_map_rect_selected",
                            rectSelected.x,
                            rectSelected.y + i * (rectSelected.h * 1.1),
                            rectSelected.w,
                            rectSelected.h)
                    } else {
                        ctx.displayTopLeft("mission_map_rect",
                            rect.x,
                            rect.y + i * (rectSelected.h * 1.1),
                            rect.w,
                            rect.h)
                    }

                    //底图
                    ctx.displayTopLeft(thisMission.getMapImage(i),
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
                    x: 41 + (rectSelected.w - rect.w),
                    y: 135 + i * (rectSelected.h * 1.1)
                },
                size: rect,
                callBack: function () {
                    if (thisMission.hasLock(i)) {
                        return;
                    }
                    thisMission.roomInfo.mapId = i + 1;
                }
            })
        }
    }

    getMapImage(mapIndex) {
        if (!this.hasLock(mapIndex)) {
            return "mission_map";
        } else {
            return "mission_map_disable";
        }
    }

    hasLock(mapIndex) {
        const userMapIndex = this.roomInfo.hardMode ? Resource.getUser().hardStage : Resource.getUser().stage;
        return userMapIndex <= mapIndex;
    }

    initControlEvent() {
        const thisMission = this;
        this.createControl({
            leftTop: {
                x: 892,
                y: 16
            },
            size: {
                w: 43,
                h: 48
            },
            callBack: function () {
                Common.gotoStage("menu");
            }
        });

        this.createControl({
            leftTop: {
                x: 48,
                y: 70
            },
            size: {
                w: 96,
                h: 25
            },
            callBack: function () {
                thisMission.roomInfo.hardMode = false;
                thisMission.roomInfo.mapId = 1;
            }
        });
        this.createControl({
            leftTop: {
                x: 168,
                y: 70
            },
            size: {
                w: 96,
                h: 25
            },
            callBack: function () {
                thisMission.roomInfo.hardMode = true;
                if (thisMission.hasLock(0)) {
                    thisMission.roomInfo.mapId = 0;
                } else {
                    thisMission.roomInfo.mapId = 1;
                }
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