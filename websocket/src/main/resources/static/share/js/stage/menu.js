/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/26
 */

import Stage from "./stage.js";
import Resource from "../tool/resource.js";
import Button from "../stage/button.js"

export default class Menu extends Stage {
    constructor() {
        super();

        //背景
        const bgImage = Resource.getImage("background_menu");
        this.createItem(function (ctx) {
            ctx.drawImage(bgImage,
                0, 0,
                bgImage.width, bgImage.height,
                0, 0,
                Resource.width(), Resource.height());
        });

        //名字
        this.createItem(function (ctx) {
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            ctx.fillText('你的名字: ' + Resource.getUser().username, Resource.width() / 2, 45);
        });

        //按钮
        this.addItem(new Button("单人游戏", 0.5, 0.35));
        this.addItem(new Button("多人游戏", 0.5, 0.55));
    }
}