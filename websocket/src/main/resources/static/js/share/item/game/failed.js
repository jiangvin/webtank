/**
 * @author 蒋文龙(Vin)
 * @description 失败信息版
 * @date 2020/12/13
 */

import Sound from "../../tool/sound.js";
import Resource from "../../tool/resource.js";
import Success from "./success.js";
import Common from "../../tool/common.js";

export default class Failed {
    constructor(stage, score, rank) {
        this.stage = stage;
        this.score = score < 0 ? 0 : score;
        this.rank = rank < 0 ? "--" : rank;
        this.init();
        Sound.lose();
    }

    init() {
        this.center = {
            x: 960,
            y: 350
        };

        const board = {
            w: 627,
            h: 398,
            speed: 25,
            y: -199,
            isEnd: () => board.y >= this.center.y
        };

        this.item = this.stage.createItem({
            draw: ctx => {
                //黑色蒙蔽
                ctx.globalAlpha = 0.6;
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, Resource.width(), Resource.height());
                ctx.globalAlpha = 1;

                //board
                if (!board.isEnd()) {
                    board.y += board.speed;
                } else {
                    board.y = this.center.y;
                }
                ctx.displayCenter("failed",
                    this.center.x, board.y,
                    board.w, board.h);

                //info
                if (board.isEnd()) {
                    Success.drawInfo(ctx, this.center, this.score, this.rank);
                    this.addButton();
                }
            }
        });
    }

    addButton() {
        if (this.addEnd) {
            return;
        }
        this.addEnd = true;

        const button = {
            w: 285,
            h: 97
        };

        this.stage.createItem({
            draw: ctx => {
                ctx.displayCenter("button_again",
                    this.center.x - 160,
                    this.center.y + 560,
                    button.w, button.h);
            }
        });

        this.stage.createControl({
            leftTop: {
                x: this.center.x - 160 - button.w / 2,
                y: this.center.y + 560 - button.h / 2
            },
            size: button,
            callBack: () => {
                Resource.getRoot().engine.again();
            }
        });

        this.stage.createItem({
            draw: ctx => {
                ctx.displayCenter("button_home",
                    this.center.x + 160,
                    this.center.y + 560,
                    button.w, button.h);
            }
        });

        this.stage.createControl({
            leftTop: {
                x: this.center.x + 160 - button.w / 2,
                y: this.center.y + 560 - button.h / 2
            },
            size: button,
            callBack: () => {
                Common.gotoStage("menu");
            }
        })
    }
}