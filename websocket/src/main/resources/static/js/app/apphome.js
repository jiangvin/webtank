/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/13
 */

import Stage from "../share/stage/stage.js";
import Resource from "../share/tool/resource.js";
import Common from "../share/tool/common.js";
import ControlUnit from "../share/item/controlunit.js";

export default class AppHome extends Stage {
    constructor() {
        super();

        //背景
        const bgImage = Resource.getImage("login");
        this.createItem({
            draw: function (ctx) {
                ctx.drawImage(bgImage,
                    0, 0,
                    bgImage.width, bgImage.height,
                    0, 0,
                    Resource.width(), Resource.height());
            }
        });

        //logo
        this.createItem({
            draw: function (ctx) {
                ctx.drawResourceCenter("logo",
                    Resource.width() / 2,
                    Resource.height() * .4,
                    Resource.width() * .6);
            }
        });

        //按钮
        this.createItem({
            draw: function (ctx) {
                ctx.drawResourceCenter("button_enter",
                    Resource.width() / 2,
                    Resource.height() * .58 + 75,
                    350, 45);
            },
            controlUnit: new ControlUnit(
                Resource.generateClientId(),
                {x: Resource.width() / 2 - 175, y: Resource.height() * .58 + 53},
                {x: Resource.width() / 2 + 175, y: Resource.height() * .58 + 97},
                function () {
                    //检测是否输入名字
                    const input = $('#input');
                    const name = input.val();
                    if (name === "") {
                        Common.addMessage("名字不能为空!", "#ff0000");
                        return;
                    }

                    input.removeClass("input-name");
                    input.css("visibility", "hidden");
                    Resource.setUserId(name);
                    Common.postRequest("/user/saveUser", {
                        userId: Resource.getUser().deviceId,
                        username: Resource.getUser().userId,
                        userDevice: Resource.getUser().deviceName
                    });
                    Common.nextStage();
                }
            )
        });

        //文字
        this.createItem({
            draw: function (context) {
                context.font = '18px Helvetica';
                context.textAlign = 'left';
                context.textBaseline = 'middle';
                context.fillStyle = '#FFF';
                context.fillText('☑ 进入游戏即代表同意',
                    Resource.width() / 2 - 160,
                    Resource.height() * .58 + 125);
                context.fillStyle = '#F00';
                context.fillText('《游戏隐私协议》',
                    Resource.width() / 2 + 20,
                    Resource.height() * .58 + 125);
            }
        });
    }

    init() {
        const input = $('#input');
        input.addClass("input-name");
        input.css("visibility", "visible");
    }
}