/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/26
 */

import Stage from "./stage.js";
import Resource from "../tool/resource.js";
import ControlUnit from "../item/controlunit.js";
import Common from "../tool/common.js";
import Control from "../tool/control.js";
import NewConfirm from "../item/newconfirm.js";
import Tip from "../item/tip.js";

export default class Shop extends Stage {
    constructor() {
        super();

        this.initShopItems();
        this.initControl();

        //背景色图层
        this.createItem({
            draw: ctx => {
                ctx.fillStyle = '#f6e7d0';
                ctx.fillRect(
                    Resource.getOffset().x,
                    Resource.getOffset().y,
                    Resource.displayW(),
                    Resource.displayH());

                this.drawCoinCount(ctx);
                this.drawShopItems(ctx);
                this.drawBlackMask(ctx);
            }
        });

        //背景图层
        this.createFullScreenItem("shop_background");
    }

    /**
     * 绘制黑色遮罩，防止超宽屏的滑动穿帮
     * @param ctx
     */
    drawBlackMask(ctx) {
        if (Resource.getOffset().x < 2) {
            return;
        }

        ctx.fillStyle = '#000';
        ctx.fillRect(
            0, 0,
            Resource.getOffset().x,
            Resource.height());
        ctx.fillRect(
            Resource.width() - Resource.getOffset().x, 0,
            Resource.getOffset().x,
            Resource.height());
    }

    init() {
        this.itemInfo.offset = 0;
        this.itemInfo.touchPoint = null;
        this.addEventListener();
        this.updateShopButtonControlStatus();
    }

    addEventListener() {
        document.addEventListener('touchmove', this.moveEvent);
        document.addEventListener('touchend', this.endEvent);
    }

    removeEventListener() {
        document.removeEventListener('touchmove', this.moveEvent);
        document.removeEventListener('touchend', this.endEvent);
    }

    drawCoinCount(ctx) {
        //绘制金币数
        const coinCount = "x" + Resource.getUser().coin;
        ctx.displayCenter("gold", 905, 225, 90);
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#000';
        ctx.strokeText(coinCount, Resource.getOffset().x + 960, Resource.getOffset().y + 228);
        ctx.fillStyle = '#f7f3df';
        ctx.fillText(coinCount, Resource.getOffset().x + 960, Resource.getOffset().y + 228);
    }

    initShopItems() {
        this.shopItems = [
            {
                title: "幽灵",
                imageId: "item_ghost",
                price: 10,
                hasBuy: () => {
                    return Resource.getUser().hasGhost();
                },
                buyType: "GHOST",
                text: [
                    "游戏中会随机出现幽灵道具",
                    "效果：使你的坦克变成半透明",
                    "且移动时无视一切障碍物",
                    "（限时一天）"
                ]
            },
            {
                title: "定时器",
                imageId: "item_clock",
                price: 18,
                hasBuy: () => {
                    return Resource.getUser().hasClock();
                },
                buyType: "CLOCK",
                text: [
                    "游戏中会随机出现定时器道具",
                    "效果：使敌方所有坦克15秒内",
                    "不能移动",
                    "（限时一天）"
                ]
            },
            {
                title: "红星",
                imageId: "item_red_star",
                price: 20,
                hasBuy: () => {
                    return Resource.getUser().hasRedStar();
                },
                buyType: "RED_STAR",
                text: [
                    "游戏中会随机出现红星道具",
                    "效果：使你的坦克直接升至四",
                    "星坦克",
                    "（限时一天）"
                ]
            },
            {
                title: "二星坦克",
                imageId: "tank02",
                imageIndex: 3,
                price: 35,
                buyType: "TANK02",
                hasBuy: () => {
                    return Resource.getUser().getTankType() === "tank02";
                },
                text: [
                    "效果：使你的坦克初始状态为",
                    "二星坦克",
                    "（限时一天）"
                ]
            },
            {
                title: "三星坦克",
                imageId: "tank03",
                imageIndex: 3,
                price: 50,
                buyType: "TANK03",
                hasBuy: () => {
                    return Resource.getUser().getTankType() === "tank03";
                },
                text: [
                    "效果：使你的坦克初始状态为",
                    "三星坦克",
                    "（限时一天）"
                ]
            }
        ];

        this.itemInfo = {
            w: 450,
            h: 540,
            interval: 40,
            imageSize: 180,
            buttonWidth: 250,
            buttonHeight: 250 / 17 * 6,
            moveWidth: 1644,
            offset: 0,
            offsetCache: 0,
            touchPoint: null
        };
        this.itemInfo.minOffset = -this.shopItems.length * (this.itemInfo.w + this.itemInfo.interval)
            + this.itemInfo.moveWidth;
    }

    initControl() {
        //返回按钮事件
        const buttonCloseRankBoard = new ControlUnit(
            Resource.generateClientId(),
            {x: 1830, y: 32},
            {x: 1910, y: 118},
            () => {
                this.removeEventListener();
                Common.gotoStage("menu");
            });
        this.controlUnits.set(buttonCloseRankBoard.id, buttonCloseRankBoard);

        //购买事件
        this.initShopButtonControl();

        //滑动之前的按压事件
        this.createControl({
            leftTop: {
                x: 138,
                y: 285
            },
            size: {
                w: this.itemInfo.moveWidth,
                h: 571
            },
            hasSound: false,
            callBack: (point) => {
                this.itemInfo.touchPoint = point;
                this.itemInfo.offsetCache = this.itemInfo.offset;
            }
        });

        //滑动辅助
        this.moveEvent = e => {
            if (!this.itemInfo.touchPoint) {
                return;
            }

            let minDistance = Resource.displayW();
            let movePoint;
            for (let i = 0; i < e.touches.length; ++i) {
                const point = Control.getTouchPoint(e.touches[i]);
                const distance = Common.distance(
                    point.x, point.y,
                    this.itemInfo.touchPoint.x,
                    this.itemInfo.touchPoint.y);
                if (distance < minDistance) {
                    movePoint = point;
                    minDistance = distance;
                    break;
                }
            }
            if (!movePoint) {
                return;
            }

            this.itemInfo.offset = (movePoint.x - this.itemInfo.touchPoint.x + this.itemInfo.offsetCache);
            if (this.itemInfo.offset > 0) {
                this.itemInfo.offset = 0;
            } else if (this.itemInfo.offset < this.itemInfo.minOffset) {
                this.itemInfo.offset = this.itemInfo.minOffset;
            }
            this.updateShopButtonControlStatus();
        };
        this.endEvent = () => {
            this.itemInfo.touchPoint = null;
        };
    }

    initShopButtonControl() {
        this.shopItems.forEach(item => {
            item.control = this.createControl({
                needOffset: false,
                callBack: () => {
                    this.buy(item);
                }
            })
        })
    }

    updateShopButtonControlStatus() {
        for (let i = 0; i < this.shopItems.length; ++i) {
            const control = this.shopItems[i].control;

            control.leftTop.x = this.itemInfo.offset +
                Resource.getOffset().x + 155 +
                this.itemInfo.w / 2 -
                this.itemInfo.buttonWidth / 2 +
                i * (this.itemInfo.w + this.itemInfo.interval);
            control.leftTop.y = Resource.getOffset().y +
                760 -
                this.itemInfo.buttonHeight / 2;
            control.rightBottom.x = control.leftTop.x + this.itemInfo.buttonWidth;
            control.rightBottom.y = control.leftTop.y + this.itemInfo.buttonHeight;

            if (this.shopItems[i].hasBuy()) {
                control.enable = false;
            } else if (control.rightBottom.x > Resource.displayW() - 80 + Resource.getOffset().x) {
                control.enable = false;
            } else control.enable = control.leftTop.x >= 80 + Resource.getOffset().x;
        }
    }

    drawShopItems(ctx) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < this.shopItems.length; ++i) {
            this.drawShopItem(ctx, i);
        }
    }

    drawShopItem(ctx, i) {
        const x = this.itemInfo.offset + Resource.getOffset().x + 155 + i * (this.itemInfo.w + this.itemInfo.interval);
        const y = Resource.getOffset().y + 300;
        if (!this.drawItemRect(ctx, x, y)) {
            return;
        }
        this.drawItemImage(ctx, x, y, i);
        this.drawItemText(ctx, x, y, i);
        this.drawItemButton(ctx, x, y, i);
    }

    drawItemRect(ctx, x, y) {
        const leftTop = {
            x: x,
            y: y
        };
        const rightButton = {
            x: x + this.itemInfo.w,
            y: y + this.itemInfo.h
        };

        if (leftTop.x > Resource.width()) {
            return false;
        }
        if (rightButton.x < 0) {
            return false;
        }

        ctx.fillStyle = '#f9f0e1';
        ctx.fillRoundRect(
            leftTop.x, leftTop.y,
            this.itemInfo.w,
            this.itemInfo.h,
            20);
        return true;
    }

    drawItemText(ctx, x, y, i) {
        const item = this.shopItems[i];
        ctx.fillStyle = '#000';
        ctx.font = '48px Arial';
        x = x + this.itemInfo.w / 2;
        ctx.fillText(item.title, x, y + 60);

        if (!item.text || item.text.length === 0) {
            return;
        }
        ctx.font = '26px Arial';
        y = y + 290;
        item.text.forEach((text => {
            ctx.fillText(text, x, y);
            y += 30;
        }));
    }

    drawItemImage(ctx, x, y, i) {
        const item = this.shopItems[i];
        const image = Resource.getImage(item.imageId);
        const index = item.imageIndex ? item.imageIndex : 0;
        ctx.drawImage(
            image,
            index * image.width / image.widthPics, 0,
            image.width / image.widthPics,
            image.height / image.heightPics,
            x + this.itemInfo.w / 2 - this.itemInfo.imageSize / 2,
            y + 180 - this.itemInfo.imageSize / 2,
            this.itemInfo.imageSize, this.itemInfo.imageSize);
    }

    drawItemButton(ctx, x, y, i) {
        const item = this.shopItems[i];

        ctx.font = 'bold 50px Arial';
        ctx.strokeStyle = '#7b642f';
        ctx.fillStyle = '#f7f3df';

        if (item.hasBuy()) {
            const image = Resource.getImage("shop_button_disable");
            ctx.drawImage(
                image,
                0, 0,
                image.width, image.height,
                x + this.itemInfo.w / 2 - this.itemInfo.buttonWidth / 2,
                y + 460 - this.itemInfo.buttonHeight / 2,
                this.itemInfo.buttonWidth, this.itemInfo.buttonHeight);
            const tips = "已购买";
            ctx.strokeText(tips, x + this.itemInfo.w / 2, y + 460);
            ctx.fillText(tips, x + this.itemInfo.w / 2, y + 460);

        } else {
            const image = Resource.getImage("shop_button");
            ctx.drawImage(
                image,
                0, 0,
                image.width, image.height,
                x + this.itemInfo.w / 2 - this.itemInfo.buttonWidth / 2,
                y + 460 - this.itemInfo.buttonHeight / 2,
                this.itemInfo.buttonWidth, this.itemInfo.buttonHeight);

            const gold = Resource.getImage("gold");
            ctx.drawImage(
                gold,
                0, 0,
                gold.width, gold.height,
                x + this.itemInfo.w / 2 - 100,
                y + 420,
                70, 70
            );

            const price = item.price;
            ctx.strokeText(price, x + this.itemInfo.w / 2 + 20, y + 460);
            ctx.fillText(price, x + this.itemInfo.w / 2 + 20, y + 460);

        }
    }

    buy(item) {
        if (Resource.getUser().coin < item.price) {
            new Tip(this, "金币不足!");
            return;
        }

        new NewConfirm(this,
            "是否确定花费金币" + item.price + "购买" + item.title + "?",
            () => {
                Common.postEncrypt("/shop/buyWithCoin", {
                    userId: Resource.getUser().deviceId,
                    buyType: item.buyType
                }, data => {
                    Resource.setUser(data);
                    this.updateShopButtonControlStatus();
                    new Tip(this, "购买成功!");
                });
            });
    }

    getId() {
        return "shop";
    }
}