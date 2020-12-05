/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/26
 */

import Item from '../item/item.js'
import Resource from "../tool/resource.js";
import ControlUnit from "../item/controlunit.js";

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
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#F00';
        this.controlUnits.forEach(function (unit) {
            const leftTop = unit.getLeftTop();
            const rightBottom = unit.getRightBottom();
            ctx.strokeRect(
                leftTop.x,
                leftTop.y,
                rightBottom.x - leftTop.x,
                rightBottom.y - leftTop.y);
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
        this.createItem({
            draw: function (ctx) {
                ctx.displayCenterRate(imageId, 0.5, 0.5, 1);
            }
        });
    }

    createItem(options) {
        const item = new Item(options);
        item.stage = this;
        this.addItem(item);
        return item;
    }

    createControl(options) {
        const controlUnit = new ControlUnit(
            Resource.generateClientId(),
            {x: Resource.width() * .1, y: Resource.height() * .1},
            {x: Resource.width() * .9, y: Resource.height() * .9},
            function () {

            });
        for (let key in options) {
            controlUnit[key] = options[key];
        }

        //根据长宽重新计算右下角的位置
        if (options.size) {
            controlUnit.rightBottom = {
                x: controlUnit.leftTop.x + options.size.w,
                y: controlUnit.leftTop.y + options.size.h
            }
        }
        this.controlUnits.set(controlUnit.id, controlUnit);
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