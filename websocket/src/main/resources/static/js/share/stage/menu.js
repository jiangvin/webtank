/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/26
 */

import Stage from "./stage.js";
import Resource from "../tool/resource.js";
import Button from "./button.js"
import Common from "../tool/common.js";
import Status from "../tool/status.js";

export default class Menu extends Stage {
    constructor() {
        super();

        //背景
        const bgImage = Resource.getImage("background_menu");
        this.createItem({
            draw: function (ctx) {
                ctx.drawImage(bgImage,
                    0, 0,
                    bgImage.width, bgImage.height,
                    0, 0,
                    Resource.width(), Resource.height());
            }
        });

        //标题
        this.createItem({
            draw: function (context) {
                context.font = 'bold 55px Helvetica';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillStyle = '#FFF';
                context.fillText('坦克世界', Resource.width() / 2, Resource.height() * .11);
            }
        });

        //名字
        this.createItem({
            draw: function (ctx) {
                ctx.font = '30px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fff';
                ctx.fillText(Resource.getUser().username,
                    Resource.width() / 2,
                    Resource.height() * .2);
            }
        });

        //按钮
        const thisMenu = this;
        this.addButton(new Button("单人游戏", Resource.width() * 0.5, Resource.height() * 0.35, function () {
            const roomInfo = {
                mapId: 1,
                roomType: "PVE",
                roomId: Resource.getUser().username + "的房间",
                joinTeamType: "RED"
            };
            thisMenu.initRoom(roomInfo);
            Resource.getRoot().initEngine(false);
        }));
        this.addButton(new Button("多人游戏", Resource.width() * 0.5, Resource.height() * 0.35 + 100, function () {
            const roomInfo = {
                mapId: 1,
                roomType: "PVE",
                roomId: Resource.getUser().username + "的房间",
                joinTeamType: "RED"
            };
            thisMenu.initRoom(roomInfo);
            Resource.getRoot().initEngine(true);
        }));
    }

    initRoom(roomInfo) {
        Status.setStatus(Status.statusPause());
        Common.nextStage();
        Resource.getRoot().currentStage().init(roomInfo);
    }
}