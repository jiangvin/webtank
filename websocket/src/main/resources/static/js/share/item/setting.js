/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2021/1/9
 */
import Resource from "../tool/resource.js";
import Sound from "../tool/sound.js";

export default class Setting {
    constructor(stage) {
        this.stage = stage;
        this.initDataCache();
        this.initImage();
        this.initControl();
    }

    initDataCache() {
        this.dataCache = {
            soundEnable: Sound.instance.soundEnable,
            musicEnable: Sound.instance.musicEnable
        };
    }

    initImage() {
        const input = $("<input/>");
        input.attr("type", "text");
        input.attr("placeholder", "请输入称号");
        input.val(Resource.getUser().userId);
        input.addClass("setting-name");
        $("#main").append(input);

        this.stage.createItem({
            id: "setting",
            draw: ctx => {
                ctx.displayAlphaMask();
                ctx.displayCenterRate("setting_bg", 0.5, 0.5, 1);

                //check
                if (Sound.instance.musicEnable) {
                    ctx.displayCenter("setting_check", 598, 322, 80);
                }
                if (Sound.instance.soundEnable) {
                    ctx.displayCenter("setting_check", 802, 322, 80);
                }

                //select
                ctx.displayCenter("setting_select", 590, 450, 70);

                //tank
                ctx.displayCenter("tank01", 1205, 530, 160, null, 3);
            }
        })
    }

    initControl() {
        this.cacheUnits = this.stage.controlUnits;
        this.stage.controlUnits = new Map();

        //close
        this.stage.createControl({
            leftTop: {
                x: 1608,
                y: 148
            },
            size: {
                w: 55,
                h: 55
            },
            callback: () => {
                this.cancel();
            }
        });

        //cancel
        this.stage.createControl({
            leftTop: {
                x: 996,
                y: 782
            },
            size: {
                w: 165,
                h: 54
            },
            callback: () => {
                this.cancel();
            }
        });

        //music
        this.stage.createControl({
            leftTop: {
                x: 570,
                y: 290
            },
            size: {
                w: 65,
                h: 65
            },
            callback: () => {
                Sound.setMusicEnable(!Sound.instance.musicEnable);
            }
        });

        //sound
        this.stage.createControl({
            leftTop: {
                x: 773,
                y: 290
            },
            size: {
                w: 65,
                h: 65
            },
            callback: () => {
                Sound.setSoundEnable(!Sound.instance.soundEnable);
            }
        });
    }

    cancel() {
        //还原设定
        Sound.setSoundEnable(this.dataCache.soundEnable);
        Sound.setMusicEnable(this.dataCache.musicEnable);

        this.destroy();
    }

    destroy() {
        $("#main").empty();
        this.stage.removeItemFromId("setting");
        this.stage.controlUnits = this.cacheUnits;
    }
}