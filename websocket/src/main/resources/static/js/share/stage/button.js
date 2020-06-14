/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/26
 */
import ControlUnit from "./controlunit.js";
import Rect from "./rect.js";

export default class Button extends Rect {
    constructor(text, x, y, callBack, width, height, font) {
        if (!width || !height) {
            width = 284;
            height = 72;
        }
        super(x, y, width, height);
        this.text = text;
        this.z = 10;
        if (font) {
            this.font = font;
        } else {
            this.font = '30px Arial';
        }

        this.generateControlUnit(callBack);
    }

    generateControlUnit(callBack) {
        const leftTop = {};
        const rightBottom = {};
        leftTop.x = this.x - this.width / 2;
        leftTop.y = this.y - this.height / 2;
        rightBottom.x = this.x + this.width / 2;
        rightBottom.y = this.y + this.height / 2;
        this.controlUnit = new ControlUnit(
            this.id,
            leftTop,
            rightBottom,
            callBack);
    }

    draw(ctx) {
        this.drawImage(ctx);

        //文字
        ctx.font = this.font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(this.text, this.x, this.y);
    }

    drawImage(ctx) {
        super.draw(ctx);
    }
}