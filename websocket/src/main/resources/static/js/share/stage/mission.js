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

        this.starMap = new Map();

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
            w: 384,
            h: 128,
            x: 82,
            y: 270,
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

        const text = ["第一关", "第二关", "第三关", "第四关"];

        this.missionPos = [
            {x: 784, y: 408},
            {x: 784 + 365, y: 408},
            {x: 784 + 365 * 2, y: 408},
            {x: 950, y: 642},
            {x: 950 + 380, y: 642}
        ];

        this.createItem({
            draw: function (ctx) {
                ctx.font = 'bold 32px HanSans';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#FFF';

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
                        map.h);

                    //文字
                    ctx.fillText(text[i],
                        200 + Resource.getOffset().x,
                        340 + Resource.getOffset().y + i * (rectSelected.h * 1.1));

                    //图标
                    if (thisMission.hasLock(i)) {
                        ctx.displayCenter("mission_lock",
                            334, 334 + i * (rectSelected.h * 1.1), 44);
                    } else {
                        ctx.displayCenter("star",
                            324, 334 + i * (rectSelected.h * 1.1), 35);

                        let star = thisMission.starMap.get(thisMission.generateSumKey(
                            i + 1,
                            thisMission.roomInfo.hardMode));
                        if (!star) {
                            star = 0;
                        }
                        ctx.fillText(star,
                            362 + Resource.getOffset().x,
                            340 + Resource.getOffset().y + i * (rectSelected.h * 1.1));
                    }
                }

                thisMission.drawMissionInfo(ctx);
            }
        });

        //控制单元
        for (let i = 0; i < mapMaxId; ++i) {
            this.createControl({
                leftTop: {
                    x: 82 + (rectSelected.w - rect.w),
                    y: 270 + i * (rectSelected.h * 1.1)
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

    drawMissionInfo(ctx) {
        if (this.roomInfo.mapId < 1) {
            return;
        }

        ctx.font = 'bold 45px HanSans';
        ctx.textAlign = 'center';

        for (let i = 0; i < 5; ++i) {
            const pos = this.missionPos[i];
            const text = this.roomInfo.mapId + "-" + (i + 1);
            const starCount = this.getStarCount(i + 1);

            ctx.displayCenter(starCount === -1 ? "mission_disable" : "mission", pos.x, pos.y, 180);
            ctx.displayCenter("mission_rect", pos.x, pos.y, 180);

            ctx.fillText(text,
                pos.x + Resource.getOffset().x,
                pos.y + 150 + Resource.getOffset().y);

            if (starCount === -1) {
                ctx.displayCenter("mission_lock", pos.x, pos.y, 44);
            } else if (starCount > 0) {
                let x = pos.x;
                if (starCount === 2) {
                    x -= 20;
                } else if (starCount === 3) {
                    x -= 40;
                }

                for (let i = 0; i < starCount; ++i) {
                    ctx.displayCenter("star", x + i * 40, pos.y, 35);
                }
            }
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

    getStarCount(subId) {
        const key = this.generateKey(this.roomInfo.mapId, subId, this.roomInfo.hardMode);
        if (this.starMap.has(key)) {
            return this.starMap.get(key);
        } else if (subId === 1) {
            return 0;
        } else {
            return -1;
        }
    }

    initControlEvent() {
        const thisMission = this;

        //start game
        this.createControl({
            leftTop: {
                x: 1486,
                y: 904
            },
            size: {
                w: 240,
                h: 70
            },
            callBack: function () {
                //困难模式未解锁的情况
                if (thisMission.roomInfo.mapId < 1) {
                    Common.addMessage("请先解锁普通模式!", "#F00");
                    return;
                }

                Common.nextStage(thisMission.roomInfo);
            }
        });

        //back
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
                Common.preStage();
            }
        });

        //select normal mode
        this.createControl({
            leftTop: {
                x: 96,
                y: 140
            },
            size: {
                w: 192,
                h: 50
            },
            callBack: function () {
                thisMission.roomInfo.hardMode = false;
                thisMission.roomInfo.mapId = 1;
            }
        });

        //select hard mode
        this.createControl({
            leftTop: {
                x: 336,
                y: 140
            },
            size: {
                w: 192,
                h: 50
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
        this.loadStarInfo();
    }

    loadStarInfo() {
        if (!Resource.getUser().deviceId) {
            return;
        }

        Common.getRequest("/user/getStarInfo?userId=" + Resource.getUser().deviceId,
            data => {
                if (!data || data.length === 0) {
                    return;
                }

                this.starMap.clear();
                data.forEach(info => {
                    this.starMap.set(this.generateKey(info.mapId, info.subId, info.hardMode), info.star);

                    const sumKey = this.generateSumKey(info.mapId, info.hardMode);
                    if (this.starMap.has(sumKey)) {
                        this.starMap.set(sumKey, this.starMap.get(sumKey) + info.star);
                    } else {
                        this.starMap.set(sumKey, info.star);
                    }
                });
            });
    }

    generateKey(mapId, subId, hardMode) {
        return mapId + "-" + subId + "-" + hardMode;
    }

    generateSumKey(mapId, hardMode) {
        return mapId + "-" + hardMode;
    }
}