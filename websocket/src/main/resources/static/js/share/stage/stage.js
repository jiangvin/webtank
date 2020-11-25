/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/26
 */

import Item from '../item/item.js'
import Resource from "../tool/resource.js";

export default class Stage {
    constructor() {
        this.items = new Map();
        this.controlUnits = new Map();
    }

    update() {
        this.items.forEach(function (item) {
            item.update();
        });
    }

    draw(ctx) {
        this.items.forEach(function (item) {
            item.draw(ctx);
        });

        //测试代码, 显示事件区域
        if (!Resource.isDebug()) {
            return;
        }
        this.controlUnits.forEach(function (unit) {
            ctx.strokeStyle = '#F00';
            ctx.strokeRect(
                unit.leftTop.x,
                unit.leftTop.y,
                unit.rightBottom.x - unit.leftTop.x,
                unit.rightBottom.y - unit.leftTop.y);
        })
    }

    processPointDownEvent(point) {
        for (let [, value] of this.controlUnits) {
            if (value.process(point)) {
                break;
            }
        }
    }

    processSocketMessage(messageDto) {
    }

    createFullScreenItem(imageId) {
        const image = Resource.getImage(imageId);
        if (!image) {
            return;
        }

        this.createItem({
            draw: function (ctx) {
                ctx.drawImage(
                    image,
                    0, 0,
                    image.width, image.height,
                    0, 0,
                    Resource.width(), Resource.height());
            }
        });
    }

    createItem(options) {
        const item = new Item(options);
        item.stage = this;
        this.addItem(item);
        return item;
    }

    addItem(item) {
        this.items.set(item.id, item);
        const controlUnit = item.controlUnit;
        if (controlUnit) {
            this.controlUnits.set(controlUnit.id, controlUnit);
        }
    }

    removeItem(item) {
        this.items.delete(item.id);
        if (item.controlUnit) {
            this.controlUnits.delete(item.controlUnit.id);
        }
    }

    /**
     * 切换场景时运行
     */
    init() {
    }

    /**
     *
     * 场景的标识符
     * @returns {string}
     */
    getId() {
        return "stage";
    }
}