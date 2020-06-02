import Menu from "../share/stage/menu";
import Resource from '../share/tool/resource'
import Control from "../share/tool/control";
import Room from "../share/stage/room";
import Adapter from "../share/tool/adapter";
Resource.setCanvas(canvas);
let ctx = canvas.getContext('2d');


/**
 * 游戏主函数，微信端入口
 */
export default class Main {
    constructor() {
        const thisMain = this;

        //获取微信用户信息
        wx.getUserInfo({
            success: function(res) {
                Resource.setUserId(res.userInfo.nickName);
                thisMain.aniId = 0;
                thisMain.restart();
            }
        })
    }

    restart() {
        Resource.setHost("116.63.170.134:8201");

        //设置缩放比例
        let width;
        let height;
        if (canvas.width > canvas.height) {
            width = canvas.width;
            height = canvas.height;
        } else {
            width = canvas.height;
            height = canvas.width;
        }
        const scale = Resource.calculateScale(width, height);
        canvas.width = width / scale;
        canvas.height = height / scale;

        Adapter.setPlatform(1);
        Control.setControlMode(true);

        this.root = Resource.getRoot();
        this.root.addStage(new Menu());
        this.root.addStage(new Room());

        //渲染层
        this.bindLoop = this.loop.bind(this);
        // 清除上一局的动画
        window.cancelAnimationFrame(this.aniId);
        this.aniId = window.requestAnimationFrame(
            this.bindLoop,
            canvas
        )
    }

    /**
     * canvas重绘函数
     * 每一帧重新绘制所有的需要展示的元素
     */
    render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //计算层和绘图层在一起
        this.root.update();
        this.root.draw(ctx);
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
