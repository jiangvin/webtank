import Menu from "../share/stage/menu";
import Resource from '../share/tool/resource'
import Control from "../share/tool/control";

Resource.setCanvas(canvas);
let ctx = canvas.getContext('2d');


/**
 * 游戏主函数
 */
export default class Main {
    constructor() {
        this.aniId = 0;
        this.root = Resource.getRoot();
        this.root.addStage(new Menu());
        this.restart();

        wx.getUserInfo({
            success: function(res) {
                Resource.setUsername(res.userInfo.nickName);
            }
        })
    }

    restart() {
        Control.setControlMode(true);

        //设置缩放比例
        const scale = Resource.calculateScale(canvas.width,canvas.height);
        canvas.width = canvas.width / scale;
        canvas.height = canvas.height / scale;

        //计算层
        const root = this.root;
        setInterval(function () {
            root.update();
        }, 17);

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
