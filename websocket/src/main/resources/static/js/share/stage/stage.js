/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/26
 */

import Item from '../item/item.js'

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
        // this.controlUnits.forEach(function (unit) {
        //     ctx.strokeStyle = '#F00';
        //     ctx.strokeRect(
        //         unit.leftTop.x,
        //         unit.leftTop.y,
        //         unit.rightBottom.x - unit.leftTop.x,
        //         unit.rightBottom.y - unit.leftTop.y);
        // })
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
}