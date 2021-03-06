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

        this.createItem({
            draw: ctx => {
                this.drawBackground(ctx);
                this.drawCoinCount(ctx);
                this.drawShopItems(ctx);
                this.drawBlackMask(ctx);
            }
        });

        //背景图层
        this.createFullScreenItem("shop_background");
    }

    init() {
        this.itemInfo.offset = 0;
        this.itemInfo.touchPoint = null;
        this.addEventListener();
        this.updateShopButtonControlStatus();
    }

    addEventListener() {
        Control.addMoveEvent("shop_move", this.moveEvent);
        Control.addUpEvent("shop_up", this.endEvent);
    }

    removeEventListener() {
        Control.removeEvent("shop_move");
        Control.removeEvent("shop_up");
    }

    drawBackground(ctx) {
        ctx.fillStyle = '#f6e7d0';
        ctx.fillRect(
            0, 0,
            Resource.width(),
            Resource.height());
    }

    drawCoinCount(ctx) {
        //绘制金币数
        const coinCount = "x" + Resource.getUser().coin;
        ctx.displayCenter("gold", 905, 225, 90);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000';
        ctx.displayText(coinCount, 960, 228, 48);
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
                    "（持续三天）"
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
                    "（持续三天）"
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
                    "（持续三天）"
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
                    "（持续三天）"
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
                    "（持续三天）"
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
        const buttonCloseRankBoard = new ControlUnit({
            leftTop: {x: 1830, y: 32},
            rightBottom: {x: 1910, y: 118},
            callback: () => {
                this.removeEventListener();
                Common.gotoStage("menu");
            }
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
            callback: (point) => {
                this.itemInfo.touchPoint = point;
                this.itemInfo.offsetCache = this.itemInfo.offset;
            }
        });

        //滑动辅助
        this.moveEvent = pointList => {
            if (!this.itemInfo.touchPoint) {
                return;
            }

            const movePoint = Common.getNearestPoint(pointList, this.itemInfo.touchPoint);
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
                callback: () => {
                    this.buy(item);
                }
            })
        })
    }

    updateShopButtonControlStatus() {
        for (let i = 0; i < this.shopItems.length; ++i) {
            const control = this.shopItems[i].control;

            control.leftTop.x = this.itemInfo.offset
                + 155 +
                this.itemInfo.w / 2 -
                this.itemInfo.buttonWidth / 2 +
                i * (this.itemInfo.w + this.itemInfo.interval);
            control.leftTop.y = 760 -
                this.itemInfo.buttonHeight / 2;
            control.rightBottom.x = control.leftTop.x + this.itemInfo.buttonWidth;
            control.rightBottom.y = control.leftTop.y + this.itemInfo.buttonHeight;

            if (this.shopItems[i].hasBuy()) {
                control.enable = false;
            } else if (control.rightBottom.x > Resource.formatWidth() - 80) {
                control.enable = false;
            } else control.enable = control.leftTop.x >= 80;
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
        const x = this.itemInfo.offset + 155 + i * (this.itemInfo.w + this.itemInfo.interval);
        const y = 300;
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

        if (leftTop.x > Resource.formatWidth()) {
            return false;
        }
        if (rightButton.x < 0) {
            return false;
        }

        ctx.fillStyle = '#f9f0e1';
        ctx.displayFillRoundRect(
            leftTop.x, leftTop.y,
            this.itemInfo.w,
            this.itemInfo.h,
            20);
        return true;
    }

    drawItemText(ctx, x, y, i) {
        const item = this.shopItems[i];
        ctx.fillStyle = '#000';
        x = x + this.itemInfo.w / 2;
        ctx.displayText(item.title, x, y + 60, 48);

        if (!item.text || item.text.length === 0) {
            return;
        }
        y = y + 290;
        item.text.forEach((text => {
            ctx.displayText(text, x, y, 26);
            y += 30;
        }));
    }

    drawItemImage(ctx, x, y, i) {
        const item = this.shopItems[i];
        const index = item.imageIndex ? item.imageIndex : 0;
        ctx.displayCenter(
            item.imageId,
            x + this.itemInfo.w / 2,
            y + 180,
            this.itemInfo.imageSize,
            this.itemInfo.imageSize,
            index);
    }

    drawItemButton(ctx, x, y, i) {
        const item = this.shopItems[i];

        ctx.font = 'bold 50px Arial';
        ctx.strokeStyle = '#7b642f';
        ctx.fillStyle = '#f7f3df';

        if (item.hasBuy()) {
            ctx.displayCenter(
                "shop_button_disable",
                x + this.itemInfo.w / 2,
                y + 460,
                this.itemInfo.buttonWidth);
            const tips = "已购买";
            ctx.displayStrokeText(tips, x + this.itemInfo.w / 2, y + 460, 50, true);
        } else {
            ctx.displayCenter(
                "shop_button",
                x + this.itemInfo.w / 2,
                y + 460,
                this.itemInfo.buttonWidth);
            ctx.displayTopLeft(
                "gold",
                x + this.itemInfo.w / 2 - 100,
                y + 420,
                70);
            const price = item.price;
            ctx.displayStrokeText(price, x + this.itemInfo.w / 2 + 20, y + 460, 50, true);
        }
    }

    buy(item) {
        if (Resource.getUser().coin < item.price) {
            new Tip(this, "金币不足!");
            return;
        }

        new NewConfirm(this,
            ["是否确定花费金币" + item.price + "购买" + item.title + "?"],
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