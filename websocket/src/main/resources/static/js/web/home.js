/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/26
 */

import Resource from "../share/tool/resource.js";
import Stage from "../share/stage/stage.js"
import Common from "../share/tool/common.js";
import Control from "../share/tool/control.js";

export default class Home extends Stage {
    constructor() {
        super();

        //背景色
        this.createItem({
            draw: function (ctx) {
                ctx.fillStyle = '#01A7EC';
                ctx.fillRect(0, 0, Resource.width(), Resource.height());
            }
        });

        //logo
        this.createItem({
            draw: function (ctx) {
                ctx.displayCenterRate("logo",
                    .5,
                    .2,
                    .55);
            }
        });
    }

    init() {
        const mainWindow = $("#main");

        const input = $("<input/>");
        input.attr("type", "text");
        input.attr("placeholder", "请输入名字");
        input.addClass("input-name-web");
        mainWindow.append(input);

        this.defaultNames = ["大酒神", "一打七", "开始行动", "挂机无罪", "求上单", "RMB玩家", "酱油位", "对面间谍"];
        input.val(this.defaultNames[Math.floor(Math.random() * this.defaultNames.length)]);

        const keyboardMode = $("<button/>");
        keyboardMode.addClass("connect");
        keyboardMode.css("top", "47%");
        keyboardMode.text("键盘控制");
        mainWindow.append(keyboardMode);

        const touchMode = $("<button/>");
        touchMode.addClass("connect");
        touchMode.attr("id", "touchMode");
        touchMode.css("top", "60%");
        touchMode.text("触屏控制");
        mainWindow.append(touchMode);

        const downloadApp = $("<button/>");
        downloadApp.addClass("connect");
        downloadApp.css("top", "73%");
        downloadApp.text("下载APP");
        mainWindow.append(downloadApp);

        //绑定事件
        const buttonEvent = function (e) {
            const name = input.val();

            //检测是否输入名字
            if (name === "") {
                Common.addMessage("名字不能为空!", "#ff0000");
                return;
            }

            const isTouch = e.currentTarget.id === "touchMode";
            Control.setControlMode(isTouch);

            Resource.setUserId(name);
            mainWindow.empty();
            Common.nextStage();
        };

        keyboardMode.bind('click', buttonEvent);
        touchMode.bind('click', buttonEvent);
        downloadApp.bind('click', function () {
            if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
                window.location.href = "https://apps.apple.com/cn/app/id1550052147";
            } else {
                window.open("app/app-release.apk");
            }
        });
    }
}