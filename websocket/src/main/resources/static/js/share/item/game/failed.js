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
    constructor(stage, score, rank, ignoreButton) {
        this.stage = stage;
        this.score = score;
        this.rank = rank;
        this.center = {
            x: 960,
            y: 350
        };
        if (ignoreButton) {
            this.center.y = 460;
            this.addEnd = true;
        }
        if (!score || score < 0 || !rank) {
            this.center.y = 540;
            this.ignoreInfo = true;
        }

        this.init();
        Sound.lose();
    }

    init() {
        const board = {
            w: 627,
            h: 398,
            speed: 25,
            y: -199,
            isEnd: () => board.y >= this.center.y
        };

        this.item = this.stage.createItem({
            draw: ctx => {
                ctx.displayAlphaMask();

                Resource.setNeedOffset(true);
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
                    if (!this.ignoreInfo) {
                        Success.drawInfo(ctx, this.center, this.score, this.rank);
                    }
                    this.addButton();
                }
                Resource.setNeedOffset(false);
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
                Resource.setNeedOffset(true);
                ctx.displayCenter("button_again",
                    800,
                    910,
                    button.w, button.h);
                ctx.displayCenter("button_home",
                    1120,
                    910,
                    button.w, button.h);
                Resource.setNeedOffset(false);
            }
        });

        this.stage.createControl({
            leftTop: {
                x: 800 - button.w / 2,
                y: 910 - button.h / 2
            },
            size: button,
            callback: () => {
                Resource.getRoot().engine.again();
            }
        });
        this.stage.createControl({
            leftTop: {
                x: 1120 - button.w / 2,
                y: 910 - button.h / 2
            },
            size: button,
            callback: () => {
                Common.gotoStage("menu");
            }
        })
    }
}