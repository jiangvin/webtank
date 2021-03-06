/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/23
 */
import Resource from "../../tool/resource.js";
import Play from "../play.js";
import Status from "../../tool/status.js";
import MapItem from "./mapitem.js";
import Height from "./height.js";
import Item from "../item.js";

export default class Tank extends MapItem {
    constructor(options) {
        super();

        this.showId = false;

        //是否有护盾
        this.hasShield = false;

        //是否有幽灵道具
        this.hasGhost = false;

        //表情相关
        this.faceTimeout = 0;
        this.faceId = null;

        for (let key in options) {
            this[key] = options[key];
        }
    }

    update() {
        super.update();

        if (this.faceTimeout > 0) {
            --this.faceTimeout;
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
            this.z = Height.ghostTank();
        } else {
            ctx.globalAlpha = 1;
            this.z = Height.common();
        }

        const size = 36 * this.scale;
        super.draw(ctx, size, size);
        ctx.globalAlpha = 1.0;
    }

    getEffectForId() {
        if (!this.showId) {
            return null;
        }

        //ID
        const id = this.id;

        //ID颜色
        let color = "#FFF";
        if (this.stage.showTeam()) {
            switch (this.teamId) {
                case 1:
                    color = '#F00';
                    break;
                case 2:
                    color = '#00F';
                    break;
            }
        }

        //ID坐标
        const x = this.screenPoint.x;
        const y = this.screenPoint.y - Resource.getUnitSize() * this.scale / 2;
        const displayScale = this.scaleForServerToWindow();
        const fontSize = Math.round(13 * displayScale);
        return new Item({
            x: x,
            y: y,
            z: Height.tankId(),
            draw: function (ctx) {
                ctx.font = fontSize + 'px Helvetica';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillStyle = color;
                ctx.fillText(id, x * displayScale, y * displayScale);
            }
        });
    }

    getEffectForShield() {
        if (!this.hasShield) {
            return null;
        }

        const thisItem = this;
        if (!thisItem.play || thisItem.play.isFinish()) {
            thisItem.play = new Play(1, 10,
                function () {
                    thisItem.play.shieldFrame = (thisItem.play.shieldFrame + 1) % 4;
                }, function () {
                    this.frames = 1;
                });
            thisItem.play.shieldFrame = 0;
        }

        if (thisItem.play.shieldFrame === undefined) {
            return null;
        }

        const shieldFrame = thisItem.play.shieldFrame;
        const image = Resource.getOrCreateImage("shield");
        const displayWidth = image.width / image.widthPics * 0.9;
        const displayHeight = image.height / image.heightPics * 0.9;
        const item = this;
        return new Item({
            x: thisItem.screenPoint.x,
            y: thisItem.screenPoint.y,
            z: Height.shield(),
            draw: function (ctx) {
                ctx.globalAlpha = 0.7;
                item.drawForServerToWindow(
                    ctx, image,
                    this.x, this.y,
                    displayWidth, displayHeight,
                    shieldFrame);
                ctx.globalAlpha = 1.0;
            }
        });
    };

    getEffectForStopMark() {
        if (this.typeId === -1) {
            return null;
        }

        if (Status.getValue() !== Status.statusPauseRed() && Status.getValue() !== Status.statusPauseBlue()) {
            return null;
        }
        if (Status.getValue() === Status.statusPauseRed() && this.teamId !== 1) {
            return null;
        }
        if (Status.getValue() === Status.statusPauseBlue() && this.teamId !== 2) {
            return null;
        }

        const image = Resource.getImage("stop");
        return new Item({
            x: this.screenPoint.x,
            y: this.screenPoint.y,
            z: Height.stopMark(),
            draw: (ctx) => {
                this.drawForServerToWindow(
                    ctx, image,
                    this.screenPoint.x, this.screenPoint.y,
                    25, 25);
            }
        });
    }

    getEffectForFace() {
        if (this.faceTimeout <= 0) {
            return null;
        }

        const image = Resource.getImage("tank_face_rect");
        const faceId = this.faceId;
        const face = Resource.getImage(faceId);
        const item = this;
        return new Item({
            x: this.screenPoint.x - 20,
            y: this.screenPoint.y - 15,
            z: Height.tankFace(),
            draw: function (ctx) {
                item.drawForServerToWindow(ctx, image, this.x, this.y, 72, 72);
                item.drawForServerToWindow(ctx, face, this.x, this.y - 15, 20, 20);
            }
        });
    }

    drawEffect(container) {
        const shield = this.getEffectForShield();
        if (shield) {
            container[container.length] = shield;
        }

        const id = this.getEffectForId();
        if (id) {
            container[container.length] = id;
        }

        const face = this.getEffectForFace();
        if (face) {
            container[container.length] = face;
        }

        const stopMark = this.getEffectForStopMark();
        if (stopMark) {
            container[container.length] = stopMark;
        }
    }

    showFace(faceId) {
        this.faceId = faceId;
        this.faceTimeout = 5 * 60;
    }
}