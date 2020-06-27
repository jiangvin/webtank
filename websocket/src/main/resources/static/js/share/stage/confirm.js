import Rect from "./rect.js";
import Resource from "../tool/resource.js";
import Item from "./item.js";
import Button from "./button.js";

/**
 * @author 蒋文龙(Vin)
 * @description 通用确认框
 * @date 2020/6/27
 */

export default class Confirm {
    constructor(stage, title, textList, callback, buttonText) {
        this.stage = stage;
        this.title = title;
        this.textList = textList;
        this.callback = callback;
        if (buttonText) {
            this.buttonText = buttonText;
        } else {
            this.buttonText = "确定";
        }
        this.initRect();
    }

    initRect() {
        //缓存，清空所有按钮事件
        this.cacheUnits = this.stage.controlUnits;
        this.stage.controlUnits = new Map();

        //背景
        const background = new Rect(Resource.width() / 2, Resource.height() / 2, Resource.width() * .6, Resource.height() * .6);
        this.stage.addItem(background);

        //文字
        const thisConfirm = this;
        const font = new Item({
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
                        Resource.height() / 2 - background.height / 2 + 30);
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
        this.stage.addItem(font);

        //确定取消按钮
        const close = function () {
            thisConfirm.stage.removeItem(background);
            thisConfirm.stage.removeItem(font);
            thisConfirm.stage.removeItem(ok);
            thisConfirm.stage.removeItem(cancel);
            thisConfirm.stage.controlUnits = thisConfirm.cacheUnits;
        };

        const ok = new Button(thisConfirm.buttonText,
            background.x - 70,
            background.y + background.height / 2 - 35,
            function () {
                if (thisConfirm.callback()) {
                    close();
                }
            }, 110, 50, '24px Arial');
        this.stage.addItem(ok);

        const cancel = new Button("取消",
            background.x + 70,
            background.y + background.height / 2 - 35,
            function () {
                close();
            }, 110, 50, '24px Arial');
        this.stage.addItem(cancel);
    }
}