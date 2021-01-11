/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2021/1/9
 */
import Resource from "../tool/resource.js";
import Sound from "../tool/sound.js";
import Control from "../tool/control.js";
import Common from "../tool/common.js";
import Tip from "./tip.js";

export default class Setting {
    constructor(stage) {
        this.stage = stage;
        this.initData();
        this.initImage();
        this.initControl();
    }

    initData() {
        this.volumeSelect = {
            minX: 590,
            maxX: 833,
            downPoint: null,
        };
        this.volumeSelect.length = this.volumeSelect.maxX - this.volumeSelect.minX;
        this.volumeSelect.x = this.volumeSelect.minX + this.volumeSelect.length * Sound.instance.volume;

        this.dataCache = {
            soundEnable: Sound.instance.soundEnable,
            musicEnable: Sound.instance.musicEnable,
            volume: Sound.instance.volume,
        };

        this.initTankColor();
    }

    initTankColor() {
        this.tankColor = [
            {
                value: "green",
                imageId: "tank01"
            },
            {
                value: "red",
                imageId: "red_tank01"
            },
            {
                value: "blue",
                imageId: "blue_tank01"
            }
        ];

        const getColorIndex = () => {
            const user = Resource.getUser();
            switch (user.skinType) {
                case "red":
                    return 1;
                case "blue":
                    return 2;
                default:
                    return 0;
            }
        };
        this.dataCache.colorIndex = getColorIndex();
    }

    initImage() {
        const input = $("<input/>");
        input.attr("type", "text");
        input.attr("placeholder", "请输入称号");
        input.val(Resource.getUser().userId);
        input.addClass("setting-name");
        $("#main").append(input);
        this.input = input;

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
                ctx.displayCenter("setting_select", this.volumeSelect.x, 450, 70);

                //tank
                ctx.displayCenter(
                    this.tankColor[this.dataCache.colorIndex].imageId,
                    1205, 530,
                    160, null,
                    3);
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

        //confirm
        this.stage.createControl({
            leftTop: {
                x: 768,
                y: 782
            },
            size: {
                w: 165,
                h: 54
            },
            callback: () => {
                this.confirm();
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

        //change color
        this.stage.createControl({
            center: {
                x: 1004,
                y: 532
            },
            size: {
                w: 70,
                h: 70
            },
            check: () => {
                return Resource.getUser().deviceId;
            },
            callback: () => {
                if (this.dataCache.colorIndex > 0) {
                    --this.dataCache.colorIndex;
                } else {
                    this.dataCache.colorIndex = this.tankColor.length - 1;
                }
            }
        });
        this.stage.createControl({
            center: {
                x: 1408,
                y: 532
            },
            size: {
                w: 70,
                h: 70
            },
            check: () => {
                return Resource.getUser().deviceId;
            },
            callback: () => {
                this.dataCache.colorIndex = (this.dataCache.colorIndex + 1) % this.tankColor.length;
            }
        });

        //volume
        const volumeControl = this.stage.createControl({
            center: {
                x: this.volumeSelect.x,
                y: 450
            },
            size: {
                w: 70,
                h: 70
            },
            callback: point => {
                this.volumeSelect.downPoint = point;
            },
            hasSound: false
        });
        volumeControl.setCenterX = x => {
            const leftX = x - volumeControl.size.w / 2;
            const rightX = x + volumeControl.size.w / 2;
            volumeControl.leftTop.x = leftX;
            volumeControl.rightBottom.x = rightX;
        };
        Control.addMoveEvent("change_volume", pointList => {
            if (!this.volumeSelect.downPoint) {
                return;
            }
            const movePoint = Common.getNearestPoint(pointList, this.volumeSelect.downPoint);
            if (!movePoint) {
                return;
            }
            movePoint.x -= Resource.getOffset().x;
            this.volumeSelect.x = Common.valueInBoundary(
                movePoint.x,
                this.volumeSelect.minX,
                this.volumeSelect.maxX);
            volumeControl.setCenterX(this.volumeSelect.x);

            const newVolume = (this.volumeSelect.x - this.volumeSelect.minX) / this.volumeSelect.length;
            Sound.setVolume(newVolume);
        });
        Control.addUpEvent("change_volume_up", () => {
            this.volumeSelect.downPoint = null;
        });
    }

    confirm() {
        const username = this.input.val();
        if (username === "") {
            Common.addMessage("名字不能为空!", "#F00");
            return;
        }
        const user = Resource.getUser();
        user.userId = username;
        user.originalUserId = username;
        if (user.deviceId) {
            user.skinType = this.tankColor[this.dataCache.colorIndex].value;
            Common.postRequest("/user/updateUser", {
                userId: user.deviceId,
                username: user.userId,
                skinType: user.skinType
            }, data => {
                Resource.getUser().setData(data);
            });
        }

        Common.saveConf();
        this.destroy();
        new Tip(this.stage, "修改成功!", 60);
    }

    cancel() {
        //还原设定
        Sound.setSoundEnable(this.dataCache.soundEnable);
        Sound.setMusicEnable(this.dataCache.musicEnable);
        Sound.setVolume(this.dataCache.volume);

        this.destroy();
    }

    destroy() {
        $("#main").empty();
        Control.removeEvent("change_volume");
        Control.removeEvent("change_volume_up");
        this.stage.removeItemFromId("setting");
        this.stage.controlUnits = this.cacheUnits;
    }
}