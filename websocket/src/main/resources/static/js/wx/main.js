import '../share/libs/jsencrypt.min.js'
import Resource from '../share/tool/resource'
import Control from "../share/tool/control";
import AdapterManager from "../share/tool/adapter/AdapterManager.js";
import Root from "../share/root.js";
import Sound from "../share/tool/sound.js";

/**
 * 游戏主函数，微信端入口
 */
export default class Main {
    constructor() {
        //加载字体
        wx.loadFont("font/RuiZiZhenYanTiMianFeiShangYong-2.ttf");

        const thisMain = this;
        thisMain.initSound();
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
        Resource.setHost("https://xiwen100.com/tank");
        Resource.setCanvas(canvas);

        //设置缩放比例
        const info = Resource.calculateWindowInfo(
            canvas.width,
            canvas.height
        );
        canvas.width = info.displayH;
        canvas.height = info.displayW;

        //胶囊问题，竖屏旋转绘制
        Resource.width = function() {
            return canvas.height;
        };
        Resource.height = function() {
            return canvas.width;
        };
        AdapterManager.setPlatform(1);
        Control.setControlMode(true);
        Control.setPortrait(true);
        Control.generateTouchModeInfo();
        const ctx = canvas.getContext('2d');
        ctx.translate(info.displayH, 0);
        ctx.rotate(Math.PI / 2);

        this.root = new Root(ctx);
        Resource.setRoot(this.root);

        //因为小程序是读取本地文件和使用微信账户，所以不需要资源加载页面和登录页面
        this.root.addGameStage();

        this.root.currentStage().init();
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

    /**
     * 加载声音引擎
     */
    initSound() {
        Sound.instance.sounds.forEach(function (sound) {
            sound.instance = new Audio(sound.src);
            if (sound.loop) {
                sound.instance.loop = true;
            }
            sound.play = function () {
                if (!sound.instance.ended) {
                    sound.stop();
                }
                sound.instance.play();
            };
            sound.stop = function () {
                sound.instance.pause();
                sound.instance.currentTime = 0;
            };
            sound.setVolume = function (volume) {
                sound.instance.volume = volume;
            }
        })
    }
}