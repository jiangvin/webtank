import MapItem from "./mapitem.js";
import Height from "./height.js";

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/5
 */

export default class Bullet extends MapItem {
    constructor(options) {
        super(options);

        this.scale = 0.4;
        this.z = Height.bullet();

        this.bulletType = 0;
        switch (this.teamId) {
            case 1:
                this.bulletType = 3;
                break;
            case 2:
                this.bulletType = 1;
                break;
        }
    }

    draw(context) {
        const displayWidth = this.image.width / this.image.widthPics * this.scale;
        const displayHeight = this.image.height / this.image.heightPics * this.scale;

        //已经爆炸
        if (this.action === 0) {
            this.bulletType = this.orientation;
        }

        //左右的时候子弹稍微上偏
        let offsetY = 0;
        if (this.orientation > 1) {
            offsetY = -4;
        }
        const center = {
            x: this.screenPoint.x,
            y: this.screenPoint.y + offsetY
        };

        this.rotate(context, center);
        this.drawForServerToWindow(
            context, this.image,
            center.x, center.y,
            displayWidth, displayHeight,
            this.bulletType);
        this.rotate(context, center, true);
    };

    rotate(ctx, center, isBack) {
        //已经爆炸
        if (this.action === 0) {
            return;
        }

        const rotatePoint = {
            x: center.x * this.scaleForServerToWindow(),
            y: center.y * this.scaleForServerToWindow()
        };

        //将绘图原点移到画布中点
        ctx.translate(rotatePoint.x, rotatePoint.y);

        //默认旋转方向为顺时针
        let direction = 1;
        if (isBack) {
            direction = -1;
        }
        //0-3 上下左右
        switch (this.orientation) {
            case 0:
                ctx.rotate((Math.PI * 3 / 2) * direction);
                break;
            case 1:
                ctx.rotate((Math.PI / 2) * direction);
                break;
            case 2:
                ctx.rotate(Math.PI * direction);
                break;
            case 3:
                break;
        }

        //还原原点
        ctx.translate(-rotatePoint.x, -rotatePoint.y);
    }

    update() {
        super.update();

        if (this.action === 0) {
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
}