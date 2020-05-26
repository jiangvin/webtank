/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/26
 */
import Item from './item.js'
import Resource from "../tool/resource.js";

export default class Button extends Item {
    constructor(text, xScale, yScale) {
        super();

        this.text = text;
        this.xScale = xScale;
        this.yScale = yScale;
    }

    draw(ctx) {

        //按钮框
        const x = Resource.width() * this.xScale;
        const y = Resource.height() * this.yScale;
        const buttonImage = Resource.getImage("button");
        const offsetX = x - buttonImage.width / 2;
        const offsetY = y - buttonImage.height / 2;
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
        ctx.fillText(this.text, x, y);
    }
}