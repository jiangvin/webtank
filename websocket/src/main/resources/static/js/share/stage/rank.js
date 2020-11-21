/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/11/21
 */

import Stage from "./stage.js";
import Resource from "../tool/resource.js";
import ControlUnit from "./controlunit.js";
import Common from "../tool/common.js";

export default class Rank extends Stage {
    constructor() {
        super();

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

        //上一页按钮
        this.createItem({
            draw: function (ctx) {
                // 镜像处理
                ctx.translate(Resource.width(), 0);
                ctx.scale(-1, 1);

                ctx.drawResourceCenter(
                    "button_next",
                    Resource.width() * .565,
                    Resource.height() * .86,
                    Resource.width() * .1);

                // 镜像处理还原坐标变换
                ctx.setTransform(1, 0, 0, 1, 0, 0);
            }
        });

        //下一页按钮
        this.createItem({
            draw: function (ctx) {
                ctx.drawResourceCenter(
                    "button_next",
                    Resource.width() * .565,
                    Resource.height() * .86,
                    Resource.width() * .1);
            }
        });
    }
}