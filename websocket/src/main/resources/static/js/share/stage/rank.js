/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/11/21
 */

import Stage from "./stage.js";
import Resource from "../tool/resource.js";
import ControlUnit from "../item/controlunit.js";
import Common from "../tool/common.js";

export default class Rank extends Stage {
    constructor() {
        super();

        const thisRank = this;
        this.rankStart = 0;
        this.isRankEnd = false;

        //背景
        this.createFullScreenItem("rank_board");

        //返回按钮事件
        const buttonCloseRankBoard = new ControlUnit({
            leftTop: {x: 1830, y: 32},
            rightBottom: {x: 1916, y: 118},
            callback: function () {
                Common.lastStage();
            }
        });
        this.controlUnits.set(buttonCloseRankBoard.id, buttonCloseRankBoard);

        //按钮大小
        const buttonSize = {
            w: 192,
            h: 72
        };
        //上一页按钮
        this.createItem({
            draw: function (ctx) {
                // 镜像处理
                ctx.translate(Resource.width(), 0);
                ctx.scale(-1, 1);

                ctx.displayCenter(
                    thisRank.lastButtonStyle(),
                    1084,
                    928,
                    buttonSize.w,
                    buttonSize.h);

                // 镜像处理还原坐标变换
                ctx.scale(-1, 1);
                ctx.translate(-Resource.width(), 0);
            },
            controlUnit: new ControlUnit({
                leftTop: {
                    x: 836 - buttonSize.w / 2,
                    y: 928 - buttonSize.h / 2
                },
                rightBottom: {
                    x: 836 + buttonSize.w / 2,
                    y: 928 + buttonSize.h / 2
                },
                callback: function () {
                    if (thisRank.rankStart <= 0) {
                        return;
                    }

                    thisRank.rankStart -= 5;
                    thisRank.loadRank();
                }
            })
        });

        //下一页按钮
        this.createItem({
            draw: function (ctx) {
                ctx.displayCenter(
                    thisRank.nextButtonStyle(),
                    1084,
                    928,
                    buttonSize.w,
                    buttonSize.h);
            },
            controlUnit: new ControlUnit({
                leftTop: {
                    x: 1084 - buttonSize.w / 2,
                    y: 928 - buttonSize.h / 2
                },
                rightBottom: {
                    x: 1084 + buttonSize.w / 2,
                    y: 928 + buttonSize.h / 2
                },
                callback: function () {
                    if (thisRank.isRankEnd) {
                        return;
                    }

                    thisRank.rankStart += 5;
                    thisRank.loadRank();
                }
            })
        });
    }

    init() {
        this.loadRank();
    }

    loadRank() {
        const thisRank = this;

        const start = thisRank.rankStart;

        //暂时禁用按钮
        thisRank.rankStart = 0;
        thisRank.isRankEnd = true;

        Common.getRequest("/user/getRankList?limit=6&start=" + start,
            /**
             *
             * @param dataList {{score,username,gameType,length}}
             */
            function (dataList) {
                //重新启用按钮
                thisRank.rankStart = start;
                thisRank.isRankEnd = dataList.length < 6;

                thisRank.createItem({
                    id: "rank_board_info",
                    draw: function (ctx) {
                        const x = 288;
                        const y = 334;

                        const interval = 114;

                        ctx.fontSize = 40;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = '#040141';
                        for (let i = 0; i < 5; ++i) {
                            if (!dataList[i]) {
                                return;
                            }

                            //rank
                            thisRank.drawRankNumber(ctx, start + 1 + i, x, y + i * interval);

                            const data = dataList[i];
                            //name
                            ctx.displayText(data.username, x + 422, y + i * interval);
                            //score
                            ctx.displayText(data.score, x + 864, y + i * interval);
                            //mode
                            ctx.displayText(data.gameType === 0 ? "单人模式" : "联机模式",
                                x + 1286,
                                y + i * interval);
                        }
                    }
                })
            })
    }

    lastButtonStyle() {
        if (this.rankStart > 0) {
            return "button_next";
        } else {
            return "button_next_disable";
        }
    }

    nextButtonStyle() {
        if (!this.isRankEnd) {
            return "button_next";
        } else {
            return "button_next_disable";
        }
    }

    drawRankNumber(ctx, number, x, y) {
        if (number <= 3) {
            const w = 80;
            const h = 74;
            ctx.displayCenter("rank_" + number, x, y, w, h);
        } else {
            ctx.displayText(number + "", x, y);
        }
    }
}