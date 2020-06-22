/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/20
 */

import Button from "./button.js";
import Resource from "../tool/resource.js";
import Rect from "./rect.js";
import Item from "./item.js";
import Common from "../tool/common.js";

export default class ShopButton extends Button {
    constructor(shop, x, y, text, image, imageIndex, priceType, price, des, done, buyType) {
        const length = 120;
        const paddingX = 40;
        const paddingY = 20;

        super(text, Resource.width() / 2 - (1 - x) * (length + paddingX),
            Resource.height() / 2 - length / 2 - paddingY / 2 + y * (length + paddingY),
            null,
            length, length);
        this.text = text;
        this.shopImage = image;
        this.imageIndex = imageIndex;
        this.priceType = priceType;
        this.price = price;
        this.shop = shop;
        this.des = des;
        this.buyType = buyType;

        //是否激活
        this.done = done;
        if (this.done) {
            this.image = Resource.getImage("button_disabled");
        }

        this.generateControlUnit();
    }

    generateControlUnit() {
        const thisButton = this;
        super.generateControlUnit(function () {
            if (thisButton.done) {
                return;
            }

            //缓存，清空所有按钮事件
            const cacheUnits = thisButton.shop.menu.controlUnits;
            thisButton.shop.menu.controlUnits = new Map();

            const background = new Rect(Resource.width() / 2, Resource.height() / 2, Resource.width() * .6, Resource.height() * .6);
            thisButton.shop.menu.addItem(background);

            //文字
            const font = new Item({
                draw: function (ctx) {
                    //标题
                    ctx.font = '26px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillStyle = '#fff';
                    ctx.fillText(thisButton.text,
                        Resource.width() / 2,
                        Resource.height() / 2 - background.height / 2 + 13);

                    //描述
                    ctx.font = '18px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#fff';
                    let height = Resource.height() / 2 - 20;
                    thisButton.des.forEach(function (str) {
                        ctx.fillText(str,
                            Resource.width() / 2,
                            height);
                        height += 20;
                    });
                }
            });
            thisButton.shop.menu.addItem(font);

            const close = function () {
                thisButton.shop.menu.removeItem(background);
                thisButton.shop.menu.removeItem(font);
                thisButton.shop.menu.removeItem(ok);
                thisButton.shop.menu.removeItem(cancel);
                thisButton.shop.menu.controlUnits = cacheUnits;
            };

            //确定取消按钮
            //按钮
            const ok = new Button("购买",
                background.x - 70,
                background.y + background.height / 2 - 35,
                function () {
                    Common.postEncrypt("/shop/buyWithCoin", {
                        userId: Resource.getUser().deviceId,
                        buyType: thisButton.buyType
                    }, function (data) {
                        close();
                        Resource.setUser(data);
                        Common.addMessage("购买成功!", '#FF0');
                        thisButton.shop.reload();
                    })
                }, 110, 50, '24px Arial');
            thisButton.shop.menu.addItem(ok);

            const cancel = new Button("取消",
                background.x + 70,
                background.y + background.height / 2 - 35,
                function () {
                    close();
                }, 110, 50, '24px Arial');
            thisButton.shop.menu.addItem(cancel);
        });
    }

    draw(ctx) {
        super.drawImage(ctx);

        //商品名字
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(this.text, this.x, this.y - 42);

        //商品图标
        const image = this.shopImage;
        const displayWidth = 36;
        const displayHeight = 36;
        ctx.drawImage(image,
            this.imageIndex * image.width / image.widthPics, 0,
            image.width / image.widthPics, image.height / image.heightPics,
            this.x - displayWidth / 2, this.y - displayHeight / 2,
            displayWidth, displayHeight);

        //商品价格
        if (this.done) {
            ctx.textAlign = 'center';
            ctx.fillText("已激活", this.x, this.y + 42);
            return;
        }

        ctx.textAlign = 'left';
        if (this.priceType === 0) {
            const coin = Resource.getImage("coin");
            ctx.drawImage(coin,
                0, 0,
                coin.width, coin.height,
                this.x - 18, this.y + 31,
                18, 18);
            ctx.fillText(this.price, this.x + 5, this.y + 42)
        } else {
            ctx.fillText("￥ " + this.price, this.x - 15, this.y + 42);
        }
    }
}