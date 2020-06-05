/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/26
 */

import Item from './item.js'
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
    }

    processPointDownEvent(point) {
        for (let [, value] of this.controlUnits) {
            if (value.process(point)) {
                break;
            }
        }
    }

    createItem(options) {
        const item = new Item(options);
        item.stage = this;
        this.items.set(item.id, item);
        return item;
    }

    addButton(button) {
        this.items.set(button.id, button);
        const controlUnit = button.controlUnit;
        this.controlUnits.set(controlUnit.id, controlUnit);
    }

    removeButton(button) {
        this.items.delete(button.id);
        this.controlUnits.delete(button.controlUnit.id);
    }

    processSocketMessage(messageDto) {
    }
}