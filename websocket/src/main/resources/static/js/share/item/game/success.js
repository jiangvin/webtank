/**
 * @author 蒋文龙(Vin)
 * @description 胜利信息板
 * @date 2020/12/12
 */
import Resource from "../../tool/resource.js";
import Sound from "../../tool/sound.js";

export default class Success {
    constructor(stage, score, rank) {
        this.stage = stage;
        this.score = score;
        this.rank = rank;

        this.center = {
            x: Resource.width() / 2,
            y: Resource.height() * .45
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

        const imgLight = Resource.getImage("success_light");
        const imgBoard = Resource.getImage("success");

        this.item = this.stage.createItem({
            draw: ctx => {
                //黑色蒙蔽
                ctx.globalAlpha = 0.6;
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, Resource.width(), Resource.height());
                ctx.globalAlpha = 1;

                //light
                if (this.boardSize.scale === 1) {
                    this.lightSize.angle += this.lightSize.speed;
                    this.rotate(ctx, this.center, Math.PI * this.lightSize.angle);
                    ctx.drawImage(
                        imgLight,
                        0, 0,
                        imgLight.width, imgLight.height,
                        this.center.x - this.lightSize.w / 2,
                        this.center.y - this.lightSize.h / 2,
                        this.lightSize.w, this.lightSize.h
                    );
                    this.rotate(ctx, this.center, -Math.PI * this.lightSize.angle);
                }

                //board
                if (this.boardSize.scale < 1) {
                    this.boardSize.scale += this.boardSize.speed;
                } else {
                    this.boardSize.scale = 1;
                }
                ctx.drawImage(
                    imgBoard,
                    0, 0,
                    imgBoard.width, imgBoard.height,
                    this.center.x - this.boardSize.w / 2 * this.boardSize.scale,
                    this.center.y - this.boardSize.h / 2 * this.boardSize.scale,
                    this.boardSize.w * this.boardSize.scale,
                    this.boardSize.h * this.boardSize.scale
                );

                //info
                if (!this.ignoreInfo) {
                    Success.drawInfo(ctx, this.center, this.score, this.rank);
                }

            }
        });
    }

    static drawInfo(ctx, center, score, rank) {
        ctx.font = '60px gameFont';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF';
        ctx.fillText("当前得分: " + score,
            center.x + Resource.getOffset().x,
            center.y + 270 + Resource.getOffset().y);

        ctx.fillText("当前排名: " + rank,
            center.x + Resource.getOffset().x,
            center.y + 400 + Resource.getOffset().y);
    }

    rotate(ctx, center, angle) {
        ctx.translate(center.x, center.y);
        ctx.rotate(angle);
        ctx.translate(-center.x, -center.y);
    }
}