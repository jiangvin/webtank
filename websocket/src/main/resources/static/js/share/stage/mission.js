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
        this.createItem({
            draw: ctx => {
                ctx.displayCenterRate(
                    this.roomInfo.hardMode ? "mission_hard" : "mission_easy",
                    .5, .5,
                    1, 1);
            }
        });

        //mission info
        this.missionPos = [
            {x: 784, y: 458},
            {x: 784 + 365, y: 458},
            {x: 784 + 365 * 2, y: 458},
            {x: 950, y: 692},
            {x: 950 + 380, y: 692}
        ];
        this.missionSize = 180;

        //map info
        this.mapMaxId = 4;
        this.rectSelected = {
            w: 384,
            h: 128,
            x: 82,
            y: 270,
        };
        this.rect = {
            w: this.rectSelected.w * .85,
            h: this.rectSelected.h * .93
        };
        this.rect.x = this.rectSelected.x + (this.rectSelected.w - this.rect.w) * .91;
        this.rect.y = this.rectSelected.y + (this.rectSelected.h - this.rect.h) / 2;

        this.createMapSelected();

        this.initControlEvent();
    }

    createMapSelected() {
        const map = {
            w: this.rect.w * .92,
            h: this.rect.h * .92
        };
        map.x = this.rect.x + (this.rect.w - map.w) / 2;
        map.y = this.rect.y + (this.rect.h - map.h) / 2;

        const text = ["第一关", "第二关", "第三关", "第四关"];

        this.createItem({
            draw: ctx => {
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#FFF';

                for (let i = 0; i < this.mapMaxId; ++i) {
                    //选择框
                    if (i === this.roomInfo.mapId - 1) {
                        ctx.displayTopLeft("mission_map_rect_selected",
                            this.rectSelected.x,
                            this.rectSelected.y + i * (this.rectSelected.h * 1.1),
                            this.rectSelected.w,
                            this.rectSelected.h)
                    } else {
                        ctx.displayTopLeft("mission_map_rect",
                            this.rect.x,
                            this.rect.y + i * (this.rectSelected.h * 1.1),
                            this.rect.w,
                            this.rect.h)
                    }

                    //底图
                    ctx.displayTopLeft(this.getMapImage(i),
                        map.x,
                        map.y + i * (this.rectSelected.h * 1.1),
                        map.w,
                        map.h);

                    //文字
                    ctx.displayText(text[i], 200, 340 + i * (this.rectSelected.h * 1.1), 32, true);

                    //图标
                    if (this.hasLock(i)) {
                        ctx.displayCenter("mission_lock",
                            334, 334 + i * (this.rectSelected.h * 1.1), 44);
                    } else {
                        ctx.displayCenter("star",
                            324, 334 + i * (this.rectSelected.h * 1.1), 35);

                        let star = this.starMap.get(this.generateSumKey(
                            i + 1,
                            this.roomInfo.hardMode));
                        if (!star) {
                            star = 0;
                        }
                        ctx.displayText(star, 362, 340 + i * (this.rectSelected.h * 1.1), 32, true);
                    }
                }

                this.drawMissionInfo(ctx);
            }
        });
    }

    drawMissionInfo(ctx) {
        if (this.roomInfo.mapId < 1) {
            return;
        }

        ctx.textAlign = 'center';

        for (let i = 0; i < 5; ++i) {
            const pos = this.missionPos[i];
            const text = this.roomInfo.mapId + "-" + (i + 1);
            const starCount = this.getStarCount(i + 1);

            ctx.displayCenter(starCount === -1 ? "mission_disable" : "mission", pos.x, pos.y, this.missionSize);
            ctx.displayCenter("mission_rect", pos.x, pos.y, this.missionSize);

            ctx.displayText(text, pos.x, pos.y + 150, 45, true);

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
        } else if (subId <= 1 || this.getStarCount(subId - 1) > 0) {
            return 0;
        } else {
            return -1;
        }
    }

    initControlEvent() {
        //select map
        for (let i = 0; i < this.mapMaxId; ++i) {
            this.createControl({
                leftTop: {
                    x: 82 + (this.rectSelected.w - this.rect.w),
                    y: 270 + i * (this.rectSelected.h * 1.1)
                },
                size: this.rect,
                check: () => {
                    return !this.hasLock(i);
                },
                callback: () => {
                    this.roomInfo.mapId = i + 1;
                }
            })
        }
        
        //start game
        for (let i = 0; i < 5; ++i) {
            this.createControl({
                leftTop: {
                    x: this.missionPos[i].x - this.missionSize / 2,
                    y: this.missionPos[i].y - this.missionSize / 2
                },
                size: {
                    w: this.missionSize,
                    h: this.missionSize
                },
                check: () => {
                    return this.roomInfo.mapId >= 1;
                },
                callback: () => {
                    if (this.getStarCount(i + 1) === -1) {
                        Common.addMessage("请先解锁前面的关卡!", "#F00");
                        return;
                    }
                    this.roomInfo.subId = (i + 1);
                    Common.nextStage(this.roomInfo);
                }
            })
        }

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
            callback: function () {
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
            callback: () => {
                this.roomInfo.hardMode = false;
                this.roomInfo.mapId = 1;
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
            callback: () => {
                this.roomInfo.hardMode = true;
                if (this.hasLock(0)) {
                    this.roomInfo.mapId = 0;
                } else {
                    this.roomInfo.mapId = 1;
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