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
        const total = Resource.instance.images.size;
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
        Resource.instance.images.forEach(function (image) {
            if (image.complete) {
                event();
            } else {
                image.onload = function () {
                    event();
                }
            }
        });

        //最大8秒直接进入游戏
        setTimeout(function () {
            if (thisLoading.percent >= 100) {
                return;
            }

            thisLoading.percent = 100;
            Resource.getRoot().nextStage();
        }, 8000);
    }
}