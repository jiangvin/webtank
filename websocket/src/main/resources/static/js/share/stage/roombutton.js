/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/4
 */
import Button from "./button.js";
import Resource from "../tool/resource.js";

export default class RoomButton extends Button {
    constructor(text, type, x, y, callBack) {
        super(text, x, y, callBack);
        this.type = type;
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
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(this.text, this.x, this.y - 13);
        ctx.fillText("(" + this.type + ")", this.x, this.y + 13);
    }

}