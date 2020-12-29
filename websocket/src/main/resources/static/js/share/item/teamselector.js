import Resource from "../tool/resource.js";

/**
 * @author 蒋文龙(Vin)
 * @description 队伍选择器
 * @date 2020/12/12
 */

export default class TeamSelector {
    constructor(stage, callback, close) {
        this.stage = stage;
        this.callback = callback;
        this.close = close;
        this.init();
    }

    init() {
        //缓存，清空所有按钮事件
        this.cacheUnits = this.stage.controlUnits;
        this.stage.controlUnits = new Map();

        //黑色蒙蔽
        this.background = this.stage.createItem({
            draw: function (ctx) {
                ctx.globalAlpha = 0.6;
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, Resource.width(), Resource.height());
                ctx.globalAlpha = 1;
            }
        });

        this.buttonSize = {
            w: 650,
            h: 240
        };
        const imgRed = Resource.getImage("join_red");
        const imgBlue = Resource.getImage("join_blue");
        let displayRate = 0;
        this.speed = 0.05;
        this.joinRed = this.stage.createItem({
            draw: ctx => {
                ctx.drawImage(imgRed,
                    imgRed.width * (1 - displayRate), 0,
                    imgRed.width * displayRate, imgRed.height,
                    Resource.getOffset().x * Resource.getScale(),
                    (Resource.getOffset().y + 420) * Resource.getScale(),
                    this.buttonSize.w * displayRate * Resource.getScale(),
                    this.buttonSize.h * Resource.getScale());
            },
            update: () => {
                //动画相关
                if (this.speed > 0) {
                    if (displayRate < 1) {
                        displayRate += this.speed;
                    } else {
                        displayRate = 1;
                        this.initControls();
                    }
                } else {
                    if (displayRate > 0) {
                        displayRate += this.speed;
                    } else {
                        displayRate = 0;
                        this.removeItems();
                    }
                }
            }
        });

        this.joinBlue = this.stage.createItem({
            draw: ctx => {
                ctx.drawImage(imgBlue,
                    0, 0,
                    imgBlue.width * displayRate, imgBlue.height,
                    (Resource.getOffset().x + 1920 - this.buttonSize.w * displayRate) * Resource.getScale(),
                    (Resource.getOffset().y + 420) * Resource.getScale(),
                    this.buttonSize.w * displayRate * Resource.getScale(),
                    this.buttonSize.h * Resource.getScale());
            }
        })
    }

    initControls() {
        if (this.isInitControls) {
            return;
        }
        this.isInitControls = true;

        this.selectRed = this.stage.createControl({
            leftTop: {
                x: 0,
                y: 420
            },
            size: this.buttonSize,
            callBack: () => {
                this.enter("RED");
            }
        });

        this.selectBlue = this.stage.createControl({
            leftTop: {
                x: 1270,
                y: 420
            },
            size: this.buttonSize,
            callBack: () => {
                this.enter("BLUE");
            }
        });

        this.back = this.stage.createControl({
            leftTop: {
                x: 50,
                y: 50
            },
            rightBottom: {
                x: 1870,
                y: 1030
            },
            callBack: () => {
                this.speed *= -1;
                this.removeControls();
            }
        })
    }

    enter(teamType) {
        this.removeControls();
        this.removeItems();
        this.callback(teamType);
    }

    removeControls() {
        this.stage.removeControl(this.back);
        this.stage.removeControl(this.selectRed);
        this.stage.removeControl(this.selectBlue);
    }

    removeItems() {
        this.stage.removeItem(this.background);
        this.stage.removeItem(this.joinRed);
        this.stage.removeItem(this.joinBlue);
        this.stage.controlUnits = this.cacheUnits;
        if (this.close) {
            this.close();
        }
    }
}