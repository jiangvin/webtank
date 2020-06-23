/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/26
 */

import Resource from "../tool/resource.js";
import Play from "./play.js";

export default class Item {
    constructor(options) {
        this.id = Resource.generateClientId();
        this.showId = false;
        this.teamId = 0;

        this.stage = null;
        this.image = null;

        this.x = 0;
        this.y = 0;
        this.z = 0;

        this.scale = 1.0;
        //屏幕坐标
        this.screenPoint = {};
        this.speed = 0;

        //动作,0是停,1是走
        this.action = 0;
        //当前定位方向,0-3 上下左右
        this.orientation = 0;

        //是否有护盾
        this.hasShield = false;

        //是否有幽灵道具
        this.hasGhost = false;

        //动画相关
        this.play = null;

        for (let key in options) {
            this[key] = options[key];
        }
    }

    update() {

    }

    draw(ctx) {
        this.screenPoint = this.stage.convertToScreenPoint({x: this.x, y: this.y});
        const point = this.screenPoint;
        const half = Resource.getUnitSize() / 2;
        if (point.x <= -half ||
            point.y <= -half ||
            point.x >= Resource.width() + half ||
            point.y >= Resource.height() + half) {
            return;
        }

        this.updateAnimation();
        this.drawId(ctx);
        this.drawImage(ctx);
        this.drawTeam(ctx);
    }

    updateAnimation() {
        if (this.play) {
            this.play.update();
        }
    }

    drawTeam(context) {
        if (!this.stage.showTeam || this.teamId <= 0 || this.teamId > 2) {
            return;
        }

        context.strokeStyle = this.getColor();
        const size = Resource.getUnitSize();
        context.strokeRect(this.screenPoint.x - size / 2, this.screenPoint.y - size / 2, size, size);
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
        const y = this.screenPoint.y - (this.image.height / this.image.heightPics) * this.scale / 2 - 5;
        context.fillText(this.id, x, y);
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

    drawImage(context) {
        const displayWidth = this.image.width / this.image.widthPics * this.scale;
        const displayHeight = this.image.height / this.image.heightPics * this.scale;

        if (this.hasGhost) {
            this.z = 2;
            context.globalAlpha = 0.5;
        } else {
            this.z = 0;
            context.globalAlpha = 1;
        }

        context.drawImage(this.image,
            this.orientation * this.image.width / this.image.widthPics, 0,
            this.image.width / this.image.widthPics, this.image.height / this.image.heightPics,
            this.screenPoint.x - displayWidth / 2, this.screenPoint.y - displayHeight / 2,
            displayWidth, displayHeight);
        context.globalAlpha = 1;

        this.drawShield(context);
    };


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

        const image = Resource.getImage("shield");
        const displayWidth = image.width / image.widthPics;
        const displayHeight = image.height / image.heightPics;

        context.globalAlpha = 0.7;
        context.drawImage(image,
            this.play.shieldFrame * image.width / image.widthPics, 0,
            image.width / image.widthPics, image.height / image.heightPics,
            this.screenPoint.x - displayWidth / 2, this.screenPoint.y - displayHeight / 2,
            displayWidth, displayHeight);
        context.globalAlpha = 1.0;
    };
}