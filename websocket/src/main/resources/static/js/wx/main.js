import '../share/libs/jsencrypt.min.js'

import Menu from "../share/stage/menu";
import Resource from '../share/tool/resource'
import Control from "../share/tool/control";
import Room from "../share/stage/room";
import Adapter from "../share/tool/adapter";
import Root from "../share/root.js";
import Sound from "../share/tool/sound.js";

Resource.setCanvas(canvas);
let ctx = canvas.getContext('2d');


/**
 * 游戏主函数，微信端入口
 */
export default class Main {
    constructor() {
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

        this.root = new Root();
        Resource.setRoot(this.root);

        //因为小程序是读取本地文件和使用微信账户，所以不需要资源加载页面和登录页面
        this.root.addStage(new Menu());
        this.root.addStage(new Room());

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
