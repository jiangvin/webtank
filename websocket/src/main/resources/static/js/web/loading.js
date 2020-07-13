/**
 * @author 蒋文龙(Vin)
 * @description 资源加载的缓冲页面
 * @date 2020/7/3
 */
import Stage from "../share/stage/stage.js";
import Resource from "../share/tool/resource.js";
import Sound from "../share/tool/sound.js";

export default class Loading extends Stage {
    constructor() {
        super();

        this.percent = 0;

        const thisLoading = this;
        this.createItem({
            draw: function (ctx) {
                ctx.font = 'bold 30px Microsoft YaHei UI';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillStyle = '#FFF';
                ctx.fillText('资源加载中 ' + thisLoading.percent + '%',
                    Resource.width() / 2,
                    Resource.height() / 2 - 10);

                ctx.lineWidth = 2;
                ctx.strokeStyle = '#FFF';
                const width = Resource.width() * .35;
                const height = 5;

                ctx.fillStyle = '#0F0';
                ctx.fillRect(
                    Resource.width() * .5 - width / 2,
                    Resource.height() * .5,
                    width * (thisLoading.percent / 100.0),
                    height);

                ctx.strokeRect(
                    Resource.width() * .5 - width / 2,
                    Resource.height() * .5,
                    width,
                    height);
            }
        });
    }

    init() {
        const thisLoading = this;
        const total = Resource.instance.images.size + Sound.instance.sounds.size;
        let loaded = 0;

        const event = function () {
            if (thisLoading.percent >= 100) {
                return;
            }

            ++loaded;
            thisLoading.percent = Math.floor(loaded * 100 / total);
            if (loaded >= total) {
                Resource.getRoot().nextStage();
            }
        };

        //加载图片
        Resource.instance.images.forEach(function (image) {
            if (image.complete) {
                event();
            } else {
                image.onload = function () {
                    event();
                }
            }
        });

        //加载音频
        createjs.Sound.alternateExtensions = ["mp3", "wav"];
        createjs.Sound.on("fileload", event, this);
        Sound.instance.sounds.forEach(function (sound) {
            createjs.Sound.registerSound(sound.src, sound.id);
            sound.play = function () {
                if (sound.loop) {
                    createjs.Sound.play(sound.id, {loop: -1});
                } else {
                    createjs.Sound.play(sound.id);
                }
            };
            sound.stop = function () {
                createjs.Sound.stop(sound.id);
            };
        });

        //切换至后台时静音
        function handleVisibilityChange() {
            if (document.hidden) {
                createjs.Sound.volume = 0;
            } else {
                createjs.Sound.volume = 1;
            }
        }
        document.addEventListener("visibilitychange", handleVisibilityChange, false);

        //每5秒检测一次，若5秒进度条未更新则直接进入
        let lastPercent = thisLoading.percent;
        const checkPercent = function() {
            if (thisLoading.percent >= 100) {
                return;
            }

            if (thisLoading.percent > lastPercent) {
                //进度条已更新
                lastPercent = thisLoading.percent;
                setTimeout(checkPercent(), 5000);
            } else {
                //进度条未更新,直接进入
                thisLoading.percent = 100;
                Resource.getRoot().nextStage();
            }
        };
        setTimeout(checkPercent(), 5000);
    }
}