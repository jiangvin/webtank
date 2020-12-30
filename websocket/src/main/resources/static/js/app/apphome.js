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

        this.createFullScreenItem("login");

        //logo
        this.createItem({
            draw: function (ctx) {
                ctx.displayCenterRate("logo",
                    .5,
                    .4,
                    .6);
            }
        });

        //按钮
        this.createItem({
            draw: function (ctx) {
                ctx.displayCenter("button_enter",
                    Resource.formatWidth() / 2,
                    Resource.formatHeight() * .58 + 150,
                    700, 90);
            },
            controlUnit: new ControlUnit({
                leftTop: {x: Resource.formatWidth() / 2 - 350, y: Resource.formatHeight() * .58 + 105},
                rightBottom: {x: Resource.formatWidth() / 2 + 350, y: Resource.formatHeight() * .58 + 195},
                callback: function () {
                    //检测是否输入名字
                    const input = $('#input');
                    const name = input.val();
                    if (name === "") {
                        Common.addMessage("名字不能为空!", "#ff0000");
                        return;
                    }

                    Resource.setUserId(name);
                    Common.postRequest("/user/saveUser", {
                        userId: Resource.getUser().deviceId,
                        username: Resource.getUser().userId,
                        userDevice: Resource.getUser().deviceName
                    }, () => {
                        $('#main').empty();
                        Common.nextStage();
                    });
                }
            })
        });

        //文字
        this.createItem({
            draw: function (context) {
                context.textAlign = 'left';
                context.textBaseline = 'middle';
                context.fillStyle = '#FFF';
                context.displayText('☑ 进入游戏即代表同意',
                    Resource.formatWidth() / 2 - 320,
                    Resource.formatHeight() * .58 + 230,
                    36);
                context.fillStyle = '#F00';
                context.displayText('《游戏隐私协议》',
                    Resource.formatWidth() / 2 + 40,
                    Resource.formatHeight() * .58 + 230,
                    36);
            }
        });
    }

    init() {
        this.input = $("<input/>");
        this.input.attr("id", "input");
        this.input.attr("type", "text");
        this.input.attr("placeholder", "请输入名字");
        this.input.addClass("input-name");
        $("#main").append(this.input);
    }
}