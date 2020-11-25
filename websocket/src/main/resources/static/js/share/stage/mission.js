/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/11/25
 */

import Stage from "./stage.js";

export default class Mission extends Stage {
    constructor() {
        super();

        this.createFullScreenItem("mission_background");
    }

    getId() {
        return "mission";
    }
}