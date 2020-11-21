import Rect from "./rect.js";
import Resource from "../tool/resource.js";
import Item from "../item/item.js";
import Button from "./button.js";

/**
 * @author 蒋文龙(Vin)
 * @description 通用确认框
 * @date 2020/6/27
 */

export default class Confirm {
    constructor(stage, title, textList, callback, buttonText, autoClose) {
        this.stage = stage;
        this.title = title;
        this.textList = textList;
        this.callback = callback;
        if (buttonText) {
            this.buttonText = buttonText;
        } else {
            this.buttonText = "确定";
        }
        if (autoClose === undefined) {
            this.autoClose = true;
        } else {
            this.autoClose = autoClose;
        }
        this.initRect();
    }

    initRect() {
        const thisConfirm = this;

        //缓存，清空所有按钮事件
        this.cacheUnits = this.stage.controlUnits;
        this.stage.controlUnits = new Map();

        //背景
        thisConfirm.background = new Rect(Resource.width() / 2, Resource.height() / 2, Resource.width() * .6, Resource.height() * .6);
        this.stage.addItem(thisConfirm.background);

        //文字
        thisConfirm.font = new Item({
            z: 10,
            draw: function (ctx) {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fff';

                //标题
                if (thisConfirm.title) {
                    ctx.font = '26px Arial';
                    ctx.fillText(
                        thisConfirm.title,
                        Resource.width() / 2,
                        Resource.height() / 2 - thisConfirm.background.height / 2 + 30);
                }

                //描述
                ctx.font = '18px Arial';
                let height = Resource.height() / 2 - 20;
                thisConfirm.textList.forEach(function (tex) {
                    ctx.fillText(tex, Resource.width() / 2, height);
                    height += 20;
                });
            }
        });
        this.stage.addItem(thisConfirm.font);

        thisConfirm.ok = new Button(thisConfirm.buttonText,
            thisConfirm.background.x - 70,
            thisConfirm.background.y + thisConfirm.background.height / 2 - 35,
            function () {
                thisConfirm.callback();
                if (thisConfirm.autoClose) {
                    thisConfirm.close();
                }
            }, 110, 50, '24px Arial');
        this.stage.addItem(thisConfirm.ok);

        thisConfirm.cancel = new Button("取消",
            thisConfirm.background.x + 70,
            thisConfirm.background.y + thisConfirm.background.height / 2 - 35,
            function () {
                thisConfirm.close();
            }, 110, 50, '24px Arial');
        this.stage.addItem(thisConfirm.cancel);
    }

    close() {
        this.stage.removeItem(this.background);
        this.stage.removeItem(this.font);
        this.stage.removeItem(this.ok);
        this.stage.removeItem(this.cancel);
        this.stage.controlUnits = this.cacheUnits;
    }
}