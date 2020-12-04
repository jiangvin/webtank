/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/4
 */
import Item from "../item.js";
import Resource from "../../tool/resource.js";

export default class MapItem extends Item {
    constructor(options) {
        super(options);

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

        //动画相关
        this.play = null;

        for (let key in options) {
            this[key] = options[key];
        }
    }

    update() {

    }

    draw(ctx, displayWidth, displayHeight) {
        //先更新动画,保证事件顺利进行
        this.updateAnimation();

        this.screenPoint = this.stage.convertToScreenPoint({x: this.x, y: this.y});
        const point = this.screenPoint;
        const half = Resource.getUnitSize() / 2;
        if (point.x <= -half ||
            point.y <= -half ||
            point.x >= Resource.width() + half ||
            point.y >= Resource.height() + half) {
            return false;
        }

        this.drawImage(ctx, displayWidth, displayHeight);
        return true;
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

        context.drawImage(this.image,
            this.orientation * this.image.width / this.image.widthPics, 0,
            this.image.width / this.image.widthPics, this.image.height / this.image.heightPics,
            this.screenPoint.x - displayWidth / 2, this.screenPoint.y - displayHeight / 2,
            displayWidth, displayHeight);
    };
}