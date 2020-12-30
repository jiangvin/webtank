/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/4
 */
import Item from "../item.js";
import Resource from "../../tool/resource.js";
import Height from "./height.js";

export default class MapItem extends Item {
    constructor(options) {
        super();

        this.image = null;

        this.x = 0;
        this.y = 0;
        this.z = Height.common();

        this.scale = 1.0;
        //屏幕坐标
        this.screenPoint = {};
        this.speed = 0;

        //动作,0是停,1是走
        //子弹和坦克需要
        this.action = 0;

        //当前定位方向,0-3 上下左右
        this.orientation = 0;

        //子弹和坦克需要
        this.teamId = 0;

        //动画相关
        this.play = null;

        for (let key in options) {
            this[key] = options[key];
        }
    }

    update() {
        this.updateAnimation();
    }

    draw(ctx, displayWidth, displayHeight) {
        if (!displayWidth) {
            displayWidth = this.image.width / this.image.widthPics * this.scale;
        }
        if (!displayHeight) {
            displayHeight = this.image.height / this.image.heightPics * this.scale;
        }

        this.drawForServerToWindow(ctx,
            this.image,
            this.screenPoint.x,
            this.screenPoint.y,
            displayWidth,
            displayHeight,
            this.orientation);
    }

    updateAnimation() {
        if (this.play) {
            this.play.update();
        }
    }

    drawForServerToWindow(ctx, image, x, y, w, h, indexX) {
        const displayScale = this.scaleForServerToWindow();
        if (indexX === undefined) {
            indexX = 0;
        }

        ctx.drawImage(image,
            indexX * image.width / image.widthPics, 0,
            image.width / image.widthPics,
            image.height / image.heightPics,
            (x - w / 2) * displayScale,
            (y - h / 2) * displayScale,
            w * displayScale,
            h * displayScale);
    }

    getType() {
        return "game";
    }

    /**
     * 是否在画面中
     */
    isInScreen() {
        const half = Resource.getUnitSize() / 2;

        this.screenPoint = this.stage.convertToScreenPoint({
            x: this.x,
            y: this.y
        });

        const w = Resource.width() * this.scaleForWindowToServer();
        const h = Resource.height() * this.scaleForWindowToServer();

        return !(this.screenPoint.x <= -half ||
            this.screenPoint.y <= -half ||
            this.screenPoint.x >= w + half ||
            this.screenPoint.y >= h + half);
    }

    /**
     * 绘制特效
     * @param container
     */
    drawEffect(container) {

    }

    scaleForWindowToServer() {
        return this.stage.scaleForWindowToServer();
    }

    scaleForServerToWindow() {
        return this.stage.scaleForServerToWindow();
    }
}