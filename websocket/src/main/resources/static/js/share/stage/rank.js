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
        const bgImage = Resource.getImage("rank_board");
        this.createItem({
            draw: function (ctx) {
                ctx.drawImage(bgImage,
                    0, 0,
                    bgImage.width, bgImage.height,
                    0, 0,
                    Resource.width(), Resource.height());
            }
        });

        //返回按钮事件
        const buttonCloseRankBoard = new ControlUnit(
            Resource.generateClientId(),
            {x: Resource.width() * .953, y: Resource.height() * .03},
            {x: Resource.width() * .997, y: Resource.height() * .11},
            function () {
                Common.lastStage();
            });
        this.controlUnits.set(buttonCloseRankBoard.id, buttonCloseRankBoard);

        //按钮大小
        const buttonSize = {
            w: Resource.width() * .1,
            h: Resource.width() * .1 * 45 / 118
        };
        //上一页按钮
        this.createItem({
            draw: function (ctx) {
                // 镜像处理
                ctx.translate(Resource.width(), 0);
                ctx.scale(-1, 1);

                ctx.drawResourceCenter(
                    thisRank.lastButtonStyle(),
                    Resource.width() * .565,
                    Resource.height() * .86,
                    buttonSize.w,
                    buttonSize.h);

                // 镜像处理还原坐标变换
                ctx.setTransform(1, 0, 0, 1, 0, 0);
            },
            controlUnit: new ControlUnit(
                Resource.generateClientId(),
                {
                    x: Resource.width() * .435 - buttonSize.w / 2,
                    y: Resource.height() * .86 - buttonSize.h / 2
                },
                {
                    x: Resource.width() * .435 + buttonSize.w / 2,
                    y: Resource.height() * .86 + buttonSize.h / 2
                },
                function () {
                    if (thisRank.rankStart <= 0) {
                        return;
                    }

                    thisRank.rankStart -= 5;
                    thisRank.loadRank();
                }
            )
        });

        //下一页按钮
        this.createItem({
            draw: function (ctx) {
                ctx.drawResourceCenter(
                    thisRank.nextButtonStyle(),
                    Resource.width() * .565,
                    Resource.height() * .86,
                    Resource.width() * .1);
            },
            controlUnit: new ControlUnit(
                Resource.generateClientId(),
                {
                    x: Resource.width() * .565 - buttonSize.w / 2,
                    y: Resource.height() * .86 - buttonSize.h / 2
                },
                {
                    x: Resource.width() * .565 + buttonSize.w / 2,
                    y: Resource.height() * .86 + buttonSize.h / 2
                },
                function () {
                    if (thisRank.isRankEnd) {
                        return;
                    }

                    thisRank.rankStart += 5;
                    thisRank.loadRank();
                }
            )
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
                        const x = Resource.width() * .15;
                        const y = Resource.height() * .31;

                        const interval = Resource.height() * .106;

                        ctx.font = '20px Helvetica';
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
                            ctx.fillText(data.username, x + Resource.width() * .22, y + i * interval);
                            //score
                            ctx.fillText(data.score, x + Resource.width() * .45, y + i * interval);
                            //mode
                            ctx.fillText(data.gameType === 0 ? "单人模式" : "联机模式",
                                x + Resource.width() * .67,
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
            ctx.drawResourceCenter("rank_" + number,
                x,
                y,
                40)
        } else {
            ctx.fillText(number + "", x, y);
        }
    }
}