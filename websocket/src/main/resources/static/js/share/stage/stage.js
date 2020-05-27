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

    pointDownEvent(point) {
        for (let [, value] of this.controlUnits) {
            if (value.process(point)) {
                break;
            }
        }
    }

    /**
     * 创建元素
     * @param draw
     */
    createItem(draw) {
        const item = new Item();
        item.draw = draw;
        this.items.set(Resource.generateClientId(), item);
    }

    createOrUpdateItem(draw, id) {
        if (this.items.has(id)) {
            this.items.get(id).draw = draw;
        } else {
            const item = new Item();
            item.draw = draw;
            this.items.set(id, item);
        }
    }

    addItem(item) {
        this.items.set(Resource.generateClientId(), item);
    }

    addButton(button) {
        this.addItem(button);
        const controlUnit = button.controlUnit;
        this.controlUnits.set(controlUnit.id, controlUnit);
    }
}