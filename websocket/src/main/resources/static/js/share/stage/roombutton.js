/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/4
 */
import Button from "./button.js";

export default class RoomButton extends Button {
    constructor(text, type, x, y, callBack, width, height) {
        super(text, x, y, callBack, width, height);
        this.type = type;
    }

    drawText(ctx) {
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(this.text, this.x, this.y - 13);
        ctx.fillText("(" + this.type + ")", this.x, this.y + 13);
    }
}