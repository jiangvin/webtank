/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/23
 */
import Resource from "../../tool/resource.js";
import Play from "../play.js";
import Status from "../../tool/status.js";
import MapItem from "./mapitem.js";

export default class Tank extends MapItem {
    constructor(options) {
        super();

        this.showId = false;

        //是否有护盾
        this.hasShield = false;

        //是否有幽灵道具
        this.hasGhost = false;

        for (let key in options) {
            this[key] = options[key];
        }
    }

    update() {
        if (this.play) {
            this.play.update();
        }

        if (this.action === 0) {
            return;
        }

        //时钟的暂停事件
        if (Status.getValue() === Status.statusPauseRed() && this.teamId === 1) {
            return;
        }
        if (Status.getValue() === Status.statusPauseBlue() && this.teamId === 2) {
            return;
        }

        switch (this.orientation) {
            case 0:
                this.y -= this.speed;
                break;
            case 1:
                this.y += this.speed;
                break;
            case 2:
                this.x -= this.speed;
                break;
            case 3:
                this.x += this.speed;
                break;
        }
    }

    draw(ctx) {
        //是否半透明效果
        if (this.hasGhost) {
            ctx.globalAlpha = 0.5;
            this.z = 2;
        } else {
            ctx.globalAlpha = 1;
            this.z = 0;
        }

        const size = 36 * this.scale;
        const inScreen = super.draw(ctx, size, size);
        ctx.globalAlpha = 1.0;

        if (inScreen) {
            this.drawId(ctx);
            this.drawShield(ctx);
            this.drawTeam(ctx);
        }
    }

    getColor() {
        if (!this.stage.showTeam) {
            return "#FFF";
        }

        switch (this.teamId) {
            case 1:
                return '#F00';
            case 2:
                return '#00F';
            default:
                return "#FFF";
        }
    };

    drawId(context) {
        if (!this.showId) {
            return;
        }

        context.font = '14px Helvetica';
        context.textAlign = 'center';
        context.textBaseline = 'bottom';
        context.fillStyle = this.getColor();

        const x = this.screenPoint.x;
        const y = this.screenPoint.y - 36 * this.scale / 2 - 5;
        context.fillText(this.id, x, y);
    }

    drawShield(context) {
        if (!this.hasShield) {
            return;
        }

        const thisItem = this;
        if (!thisItem.play || thisItem.play.isFinish()) {
            thisItem.play = new Play(1, 15,
                function () {
                    thisItem.play.shieldFrame = (thisItem.play.shieldFrame + 1) % 4;
                }, function () {
                    this.frames = 1;
                });
            thisItem.play.shieldFrame = 0;
        }
        if (thisItem.play.shieldFrame === undefined) {
            return;
        }

        const image = Resource.getOrCreateImage("shield");
        const displayWidth = image.width / image.widthPics * Resource.getRoomScale() * 0.9;
        const displayHeight = image.height / image.heightPics * Resource.getRoomScale() * 0.9;

        context.globalAlpha = 0.7;
        context.drawImage(image,
            this.play.shieldFrame * image.width / image.widthPics, 0,
            image.width / image.widthPics, image.height / image.heightPics,
            this.screenPoint.x - displayWidth / 2, this.screenPoint.y - displayHeight / 2,
            displayWidth, displayHeight);
        context.globalAlpha = 1.0;
    };

    drawTeam(context) {
        if (!this.stage.showTeam || this.teamId <= 0 || this.teamId > 2) {
            return;
        }

        context.strokeStyle = this.getColor();
        const size = Resource.getUnitSize();
        context.strokeRect(this.screenPoint.x - size / 2, this.screenPoint.y - size / 2, size, size);
    };
}