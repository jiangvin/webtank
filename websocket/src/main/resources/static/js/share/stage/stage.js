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

        this.drawHotZone(ctx);
    }

    /**
     * 在debug模式下显示热区
     * @param ctx
     */
    drawHotZone(ctx) {
        //测试代码, 显示事件区域
        if (!Resource.isDebug()) {
            return;
        }
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#F00';
        this.controlUnits.forEach(function (unit) {
            if (!unit.enable) {
                return;
            }
            const leftTop = unit.getLeftTop();
            const rightBottom = unit.getRightBottom();
            ctx.strokeRect(
                leftTop.x * Resource.getScale(),
                leftTop.y * Resource.getScale(),
                (rightBottom.x - leftTop.x) * Resource.getScale(),
                (rightBottom.y - leftTop.y) * Resource.getScale());
        })
    }

    processPointDownEvent(point) {
        for (let [, value] of this.controlUnits) {
            if (!value.enable) {
                continue;
            }
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
        const controlUnit = new ControlUnit(options);
        this.controlUnits.set(controlUnit.id, controlUnit);
        return controlUnit;
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

    removeControl(control) {
        this.controlUnits.delete(control.id);
    }

    removeItemFromId(itemId) {
        const item = this.items.get(itemId);
        if (!item) {
            return;
        }
        this.removeItem(item);
    }

    removeControlFromId(controlId) {
        const control = this.controlUnits.get(controlId);
        if (!control) {
            return;
        }
        this.removeControl(control);
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

    /**
     * 绘制黑色遮罩，防止超宽屏的元素绘制到屏幕外
     * @param ctx
     */
    drawBlackMask(ctx) {
        this.drawBlackMaskX(ctx);
        this.drawBlackMaskY(ctx);
    }

    drawBlackMaskX(ctx) {
        const width = Resource.getOffset().x * Resource.getScale();
        if (width < 2) {
            return;
        }

        ctx.fillStyle = '#000';
        ctx.fillRect(
            0, 0,
            width,
            Resource.height());
        ctx.fillRect(
            Resource.width() - width, 0,
            width,
            Resource.height());
    }

    drawBlackMaskY(ctx) {
        const height = Resource.getOffset().y * Resource.getScale();
        if (height < 2) {
            return;
        }

        ctx.fillStyle = '#000';
        ctx.fillRect(
            0, 0,
            Resource.width(),
            height);
        ctx.fillRect(
            0, Resource.height() - height,
            Resource.width(),
            height);
    }
}