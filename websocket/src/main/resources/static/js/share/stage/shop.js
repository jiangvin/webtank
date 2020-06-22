import Rect from "./rect.js";
import Resource from "../tool/resource.js";
import Button from "./button.js";
import Item from "./item.js";
import ShopButton from "./shopbutton.js";

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/20
 */

export default class Shop {
    constructor(menu) {
        this.menu = menu;

        this.currentShopItems = [];
        this.totalShopItems = [];
        this.shopItemStart = 0;

        this.initShopItems();
    }

    initShop() {
        const thisShop = this;
        const items = [];

        const background = new Rect(Resource.width() / 2, Resource.height() / 2, Resource.width() * .7, Resource.height() * .8);
        items[items.length] = background;

        // 金币
        const coinImage = Resource.getImage("coin");
        items[items.length] = new Item({
            draw: function (ctx) {
                ctx.drawImage(coinImage,
                    0, 0,
                    coinImage.width, coinImage.height,
                    Resource.width() / 2 - 50, background.y - background.height / 2 + 10,
                    coinImage.width * .75, coinImage.width * .75);

                ctx.font = '24px Arial';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fff';
                ctx.fillText(" x " + Resource.getUser().coin,
                    Resource.width() / 2 - 5, background.y - background.height / 2 + 32);
            }
        });

        //按钮
        items[items.length] = background;
        items[items.length] = new Button("上一页",
            background.x - 120,
            background.y + background.height / 2 - 35,
            function () {
                if (thisShop.shopItemStart > 0) {
                    thisShop.shopItemStart -= 6;
                    thisShop.loadShopItems();
                }
            }, 110, 50, '24px Arial');
        items[items.length] = new Button("下一页",
            background.x,
            background.y + background.height / 2 - 35,
            function () {
                if (thisShop.shopItemStart < 12) {
                    thisShop.shopItemStart += 6;
                    thisShop.loadShopItems();
                }
            }, 110, 50, '24px Arial');
        items[items.length] = new Button("返回",
            background.x + 120,
            background.y + background.height / 2 - 35,
            function () {
                thisShop.menu.switchButtons(-7);
            }, 110, 50, '24px Arial');

        return items;
    }

    loadShopItems() {
        this.removeCurrentItems();
        for (let i = this.shopItemStart; i < this.shopItemStart + 6; ++i) {
            if (!this.totalShopItems[i]) {
                return;
            }
            this.currentShopItems[this.currentShopItems.length] = this.totalShopItems[i];
            this.menu.addItem(this.totalShopItems[i]);
        }
    }

    removeCurrentItems() {
        const thisShop = this;
        this.currentShopItems.forEach(function (item) {
            thisShop.menu.removeItem(item);
        });
        this.currentShopItems = [];
    }

    initShopItems() {
        const items = this.totalShopItems;

        //第一页
        items[items.length] = new ShopButton(this, 0, 0, "幽灵(限时)", Resource.getImage("item_ghost"), 0, 0, 8,
            ["游戏中会随机出现幽灵道具（限时一天）",
                "效果：使你的坦克变成半透明移动时无视一切障碍物"]);
        items[items.length] = new ShopButton(this, 1, 0, "定时器(限时)", Resource.getImage("item_clock"), 0, 0, 10,
            ["游戏中会随机出现定时器道具（限时一天）",
                "效果：使敌方所有坦克10秒内不能移动"]);
        items[items.length] = new ShopButton(this, 2, 0, "红星(限时)", Resource.getImage("item_red_star"), 0, 0, 12,
            ["游戏中会随机出现红星道具（限时一天）",
                "效果：使你的坦克直接升至四星坦克"],
            Resource.getUser().hasRedStar());
        items[items.length] = new ShopButton(this, 0, 1, "二星坦克(限时)", Resource.getImage("tank02"), 3, 0, 20,
            ["效果：使你的坦克初始状态为二星坦克（限时一天）"]);
        items[items.length] = new ShopButton(this, 1, 1, "三星坦克(限时)", Resource.getImage("tank03"), 3, 0, 40,
            ["效果：使你的坦克初始状态为三星坦克（限时一天）"]);
        items[items.length] = new ShopButton(this, 2, 1, "X 50(首充)", Resource.getImage("coin"), 0, 1, 2,
            ["获得50个金币（仅限一次）"]);

        //第二页
        items[items.length] = new ShopButton(this, 0, 0, "X 60", Resource.getImage("coin"), 0, 1, 6,
            ["获得60个金币"]);
        items[items.length] = new ShopButton(this, 1, 0, "X 250", Resource.getImage("coin"), 0, 1, 24,
            ["获得250个金币"]);
        items[items.length] = new ShopButton(this, 2, 0, "X 500", Resource.getImage("coin"), 0, 1, 42,
            ["获得500个金币"]);
        items[items.length] = new ShopButton(this, 0, 1, "幽灵(永久)", Resource.getImage("item_ghost"), 0, 1, 12,
            ["游戏中会随机出现幽灵道具",
                "效果：使你的坦克变成半透明移动时无视一切障碍物"]);
        items[items.length] = new ShopButton(this, 1, 1, "定时器(永久)", Resource.getImage("item_clock"), 0, 1, 15,
            ["游戏中会随机出现定时器道具",
                "效果：使敌方所有坦克10秒内不能移动"]);
        items[items.length] = new ShopButton(this, 2, 1, "红星(永久)", Resource.getImage("item_red_star"), 0, 1, 18,
            ["游戏中会随机出现红星道具",
                "效果：使你的坦克直接升至四星坦克"]);

        //第三页
        items[items.length] = new ShopButton(this, 0, 0, "黄金坦克(限时)", Resource.getImage("tank09"), 3, 1, 30,
            ["效果：使你的坦克初始状态为黄金坦克（限时三天）"]);
    }
}