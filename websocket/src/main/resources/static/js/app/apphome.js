/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/13
 */

import Stage from "../share/stage/stage.js";
import Resource from "../share/tool/resource.js";
import Common from "../share/tool/common.js";
import Adapter from "../share/tool/adapter.js";

export default class AppHome extends Stage {
    constructor() {
        super();

        //背景
        const bgImage = Resource.getImage("background_loading","jpg");
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
                context.fillText('首次登录', Resource.width() / 2, 40);
            }
        });

        const input = $('#input');
        input.css("visibility", "visible");
        const button = $('#button1');
        button.text("进入游戏");
        button.css("top", "35%");
        button.css("visibility", "visible");
        button.bind('click',function () {
            //检测是否输入名字
            const name = input.val();
            if (name === "") {
                Common.addMessage("名字不能为空!", "#ff0000");
                return;
            }

            input.css("visibility", "hidden");
            button.css("visibility", "hidden");
            Resource.setUserId(name);
            Common.postRequest("/user/saveUser", {
                userId: Resource.getUser().deviceId,
                username: Resource.getUser().userId,
                userDevice: Resource.getUser().deviceName
            });
            Common.nextStage();
            Adapter.initInput();
        });
    }
}