/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/28
 */
import Engine from "./engine.js";
import Resource from "../tool/resource.js";

export default class AiEngine extends Engine {
    constructor(room) {
        super(room);
        this.setUserId();
    }

    setUserId() {
        Resource.setUserId(Resource.generateClientId());
    }
}