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
        this.drawImage(ctx, displayWidth, displayHeight);
    }

    updateAnimation() {
        if (this.play) {
            this.play.update();
        }
    }

    drawImage(context, displayWidth, displayHeight) {
        if (!displayWidth) {
            displayWidth = this.image.width / this.image.widthPics * this.scale;
        }
        if (!displayHeight) {
            displayHeight = this.image.height / this.image.heightPics * this.scale;
        }

        displayWidth *= Resource.getRoomScale();
        displayHeight *= Resource.getRoomScale();


        context.drawImage(this.image,
            this.orientation * this.image.width / this.image.widthPics, 0,
            this.image.width / this.image.widthPics, this.image.height / this.image.heightPics,
            this.screenPoint.x - displayWidth / 2, this.screenPoint.y - displayHeight / 2,
            displayWidth, displayHeight);
    };

    getType() {
        return "game";
    }

    /**
     * 是否在画面中
     */
    isInScreen() {
        const half = Resource.getUnitSize() * Resource.getRoomScale() / 2;

        this.screenPoint = this.stage.convertToScreenPoint({
            x: this.x * Resource.getRoomScale(),
            y: this.y * Resource.getRoomScale()
        });

        return !(this.screenPoint.x <= -half ||
            this.screenPoint.y <= -half ||
            this.screenPoint.x >= Resource.width() + half ||
            this.screenPoint.y >= Resource.height() + half);
    }

    /**
     * 绘制特效
     * @param container
     */
    drawEffect(container) {

    }
}