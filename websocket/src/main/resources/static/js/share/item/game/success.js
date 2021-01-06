/**
 * @author 蒋文龙(Vin)
 * @description 胜利信息板
 * @date 2020/12/12
 */
import Resource from "../../tool/resource.js";
import Sound from "../../tool/sound.js";

export default class Success {
    constructor(stage, score, rank, star) {
        this.stage = stage;
        this.score = score;
        this.rank = rank;
        this.star = star;

        this.center = {
            x: 960,
            y: 460
        };
        if (!score || score < 0 || !rank) {
            this.center.y = 540;
            this.ignoreInfo = true;
        }
        this.init();
        Sound.win();
    }

    init() {
        this.boardSize = {
            w: 627,
            h: 398,
            speed: 0.05,
            scale: 0
        };
        this.lightSize = {
            w: 1127,
            h: 1127,
            speed: 1 / 180,
            angle: 0
        };
        this.starInfo = {
            index: 0,
            scale: 0,
            speed: 0.15,
            x: this.center.x,
            y: this.center.y + 260,
            size: 80
        };
        if (this.star === 3) {
            this.starInfo.x -= 100;
        } else if (this.star === 2) {
            this.starInfo.x -= 50;
        }

        this.item = this.stage.createItem({
            draw: ctx => {
                ctx.displayAlphaMask();

                Resource.setNeedOffset(true);
                //light
                if (this.boardSize.scale === 1) {
                    this.lightSize.angle += this.lightSize.speed;
                    this.rotate(ctx, this.center, Math.PI * this.lightSize.angle);
                    ctx.displayCenter("success_light",
                        this.center.x, this.center.y,
                        this.lightSize.w, this.lightSize.h);
                    this.rotate(ctx, this.center, -Math.PI * this.lightSize.angle);
                }

                //board
                if (this.boardSize.scale < 1) {
                    this.boardSize.scale += this.boardSize.speed;
                } else {
                    this.boardSize.scale = 1;
                }
                ctx.displayCenter("success",
                    this.center.x, this.center.y,
                    this.boardSize.w * this.boardSize.scale,
                    this.boardSize.h * this.boardSize.scale);

                //info
                if (!this.ignoreInfo) {
                    this.drawStar(ctx);
                    Success.drawInfo(ctx, {
                        x: this.center.x,
                        y: this.center.y + 100
                    }, this.score, this.rank);
                }
                Resource.setNeedOffset(false);
            }
        });
    }

    drawStar(ctx) {
        //等待之前的动画完成
        if (this.boardSize.scale < 1) {
            return;
        }

        //动画
        if (this.starInfo.scale < 1) {
            this.starInfo.scale += this.starInfo.speed;
        } else {
            if (this.starInfo.index < this.star - 1) {
                ++this.starInfo.index;
                this.starInfo.scale = this.starInfo.speed;
            } else {
                this.starInfo.scale = 1;
            }
        }

        for (let i = 0; i < this.star; ++i) {
            let scale;
            if (i > this.starInfo.index) {
                break;
            }
            if (i < this.starInfo.index) {
                scale = 1;
            } else {
                scale = this.starInfo.scale;
            }

            ctx.displayCenter("star",
                this.starInfo.x + i * 100, this.starInfo.y,
                scale * this.starInfo.size,
                scale * this.starInfo.size);
        }
    }

    static drawInfo(ctx, center, score, rank) {
        ctx.fontSize = 60;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF';
        ctx.displayGameText("当前得分: " + score,
            center.x, center.y + 270);

        ctx.displayGameText("当前排名: " + rank,
            center.x,
            center.y + 400);
    }

    rotate(ctx, center, angle) {
        const rotateCenter = {
            x: (center.x + Resource.getOffset().x) * Resource.getScale(),
            y: (center.y + Resource.getOffset().y) * Resource.getScale()
        };
        ctx.translate(rotateCenter.x, rotateCenter.y);
        ctx.rotate(angle);
        ctx.translate(-rotateCenter.x, -rotateCenter.y);
    }
}