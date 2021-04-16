import '../share/libs/jsencrypt.min.js'
import Resource from '../share/tool/resource'
import AdapterManager from "../share/tool/adapter/AdapterManager.js";
import Root from "../share/root.js";
import Common from "../share/tool/common.js";

/**
 * 游戏主函数，微信端入口
 */
export default class Main {
    constructor() {
        //加载字体
        wx.loadFont("font/RuiZiZhenYanTiMianFeiShangYong-2.ttf");

        const thisMain = this;
        //获取微信用户信息
        wx.login({
            success: function (res) {
                console.log(res);
                wx.getUserInfo({
                    success: function (res) {
                        console.log(res);
                        Resource.setUserId(res.userInfo.nickName);
                        thisMain.aniId = 0;
                        thisMain.restart();
                    }
                })
            }
        });
    }

    restart() {
        Resource.setCanvas(canvas);

        //设置缩放比例,另因胶囊位置问题，设定为竖屏旋转绘制
        const info = Resource.calculateWindowInfo(
            canvas.width,
            canvas.height
        );
        canvas.width = info.displayH;
        canvas.height = info.displayW;
        Resource.width = function () {
            return canvas.height;
        };
        Resource.height = function () {
            return canvas.width;
        };
        const ctx = canvas.getContext('2d');
        ctx.translate(info.displayH, 0);
        ctx.rotate(Math.PI / 2);

        this.root = new Root(ctx);
        Resource.setRoot(this.root);
        AdapterManager.setPlatform(1);
        Common.initGame(() => {
            this.root.currentStage().init();
            //渲染层
            this.bindLoop = this.loop.bind(this);
            // 清除上一局的动画
            window.cancelAnimationFrame(this.aniId);
            this.aniId = window.requestAnimationFrame(
                this.bindLoop,
                canvas
            )
        });
    }

    /**
     * canvas重绘函数
     * 每一帧重新绘制所有的需要展示的元素
     */
    render() {
        this.root.update();
        this.root.draw();
    }

    // 实现游戏帧循环
    loop() {
        this.render();

        this.aniId = window.requestAnimationFrame(
            this.bindLoop,
            canvas
        )
    }
}