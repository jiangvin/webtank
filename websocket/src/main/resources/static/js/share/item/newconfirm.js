/**
 * @author 蒋文龙(Vin)
 * @description 新样式的确认框
 * @date 2020/12/26
 */
import Resource from "../tool/resource.js";

export default class NewConfirm {
    constructor(stage, textList, callback) {
        this.stage = stage;
        this.textList = textList;
        this.callback = callback;
        this.init();
    }

    init() {
        //缓存，清空所有按钮事件
        this.cacheUnits = this.stage.controlUnits;
        this.stage.controlUnits = new Map();

        this.textInterval = 55;

        this.stage.createItem({
            id: "confirm_rect",
            draw: ctx => {
                //黑色蒙蔽
                ctx.globalAlpha = 0.6;
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, Resource.width(), Resource.height());
                ctx.globalAlpha = 1;

                //框体
                ctx.displayCenter(
                    "confirm",
                    960,
                    540,
                    900);

                //文字
                ctx.fillStyle = '#000';
                ctx.font = '40px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                let y = 485;
                this.textList.forEach(text => {
                    ctx.fillText(text,
                        952 + Resource.getOffset().x,
                        y + Resource.getOffset().y);
                    y += this.textInterval;
                });
            }
        });

        //创建事件
        this.stage.createControl({
            leftTop: {
                x: 690,
                y: 680
            },
            size: {
                w: 238,
                h: 70
            },
            callBack: () => {
                if (this.callback) {
                    this.callback();
                }
                this.close();
            }
        });
        this.stage.createControl({
            leftTop: {
                x: 990,
                y: 680
            },
            size: {
                w: 238,
                h: 70
            },
            callBack: () => {
                this.close();
            }
        })
    }

    close() {
        this.stage.removeItemFromId("confirm_rect");
        this.stage.controlUnits = this.cacheUnits;
    }
}