/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/26
 */
import Item from './item.js'
import Resource from "../tool/resource.js";
import ControlUnit from "./controlunit.js";

export default class Button extends Item {
    constructor(text, x, y, callBack) {
        super();

        this.id = Resource.generateClientId();
        this.text = text;
        this.x = x;
        this.y = y;
        this.z = 10;

        this.generateControlUnit(callBack);
    }

    generateControlUnit(callBack) {
        const leftTop = {};
        const rightBottom = {};
        leftTop.x = this.x - 284 / 2;
        leftTop.y = this.y - 72 / 2;
        rightBottom.x = this.x + 284 / 2;
        rightBottom.y = this.y + 72 / 2;
        this.controlUnit = new ControlUnit(
            this.id,
            leftTop,
            rightBottom,
            callBack);
    }

    draw(ctx) {
        //按钮框
        const buttonImage = Resource.getImage("button");
        const offsetX = this.x - buttonImage.width / 2;
        const offsetY = this.y - buttonImage.height / 2;
        ctx.drawImage(buttonImage,
            0, 0,
            buttonImage.width, buttonImage.height,
            offsetX, offsetY,
            buttonImage.width, buttonImage.height);

        //文字
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(this.text, this.x, this.y);
    }
}