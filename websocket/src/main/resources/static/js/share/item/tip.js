import Resource from "../tool/resource.js";

/**
 * @author 蒋文龙(Vin)
 * @description 提示信息
 * @date 2020/12/26
 */

export default class Tip {
    constructor(stage, text) {
        this.stage = stage;
        this.text = text;
        this.init();
    }

    init() {
        const size = {
            w: 420,
            h: 110,
            timeout: 80
        };

        //缓存，清空所有按钮事件
        this.cacheUnits = this.stage.controlUnits;
        this.stage.controlUnits = new Map();

        this.stage.createItem({
            id: "tip",
            draw: ctx => {
                ctx.globalAlpha = 0.6;
                ctx.fillStyle = '#000';
                ctx.displayFillRoundRect(
                    Resource.formatWidth() / 2 - size.w / 2,
                    Resource.formatHeight() / 2 - size.h / 2,
                    size.w, size.h, 20);
                ctx.globalAlpha = 1;

                //文字
                ctx.fillStyle = '#FFF';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.displayText(this.text,
                    Resource.formatWidth() / 2,
                    Resource.formatHeight() / 2,
                    48);
            },
            update: () => {
                if (size.timeout > 0) {
                    --size.timeout;
                } else {
                    this.close();
                }
            }
        })
    }

    close() {
        this.stage.removeItemFromId("tip");
        this.stage.controlUnits = this.cacheUnits;
    }
}