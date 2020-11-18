/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/20
 */

import Button from "./button.js";
import Resource from "../tool/resource.js";
import Common from "../tool/common.js";
import Confirm from "./confirm.js";

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
            this.image = Resource.getOrCreateImage("button_disabled");
        }

        this.generateControlUnit();
    }

    generateControlUnit() {
        const thisButton = this;
        super.generateControlUnit(function () {
            if (thisButton.done) {
                return;
            }

            const confirm = new Confirm(thisButton.shop.menu, thisButton.text, thisButton.des, function () {
                    if (!thisButton.buyType || thisButton.priceType === 1) {
                        Common.addMessage("暂未开放，敬请期待", "#FF0");
                        return;
                    }

                    Common.postEncrypt("/shop/buyWithCoin", {
                        userId: Resource.getUser().deviceId,
                        buyType: thisButton.buyType
                    }, function (data) {
                        Resource.setUser(data);
                        Common.addMessage("购买成功!", '#FF0');
                        confirm.close();
                        thisButton.shop.reload();
                    });
                },
                "购买",
                false);
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
            const coin = Resource.getOrCreateImage("coin");
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