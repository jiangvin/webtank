/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/17
 */
import Item from "../share/stage/item.js";
import ControlUnit from "../share/stage/controlunit.js";

export default class WxInput extends Item {
    constructor(id, x, y, width, height, placeholder) {
        super();
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.placeholder = placeholder;
        this.text = "";
        this.generateControlUnit();
    }

    generateControlUnit() {
        const leftTop = {};
        const rightBottom = {};
        leftTop.x = this.x;
        leftTop.y = this.y;
        rightBottom.x = this.x + this.width;
        rightBottom.y = this.y + this.height;
        const thisInput = this;
        this.controlUnit = new ControlUnit(
            this.id,
            leftTop,
            rightBottom,
            function () {
                const obj = {};
                obj['defaultValue'] = thisInput.text;
                obj['maxLength'] = 100;
                obj['multiple'] = false;
                obj['confirmHold'] = false;
                obj['confirmType'] = 'done';
                wx.showKeyboard(obj);
                wx.onKeyboardConfirm(function (result) {
                    thisInput.text = result.value;
                    wx.offKeyboardConfirm(this);
                })
            });
    }

    draw(ctx) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.lineWidth = 2;
        ctx.fillStyle = '#000';
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        let text;
        if (this.text === "") {
            text = this.placeholder;
        } else {
            text = this.text;
        }
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, this.x + this.width / 2, this.y + this.height / 2);
    }
}