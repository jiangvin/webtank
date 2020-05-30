/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/28
 */
import Engine from "./engine.js";
import Common from "../tool/common.js";
import Resource from "../tool/resource.js";

export default class AiEngine extends Engine {
    constructor(room) {
        super(room);

        const thisEngine = this;
        thisEngine.tankTypes = null;
        thisEngine.playerLifeCount = 10;
        thisEngine.mapInfo = null;
        thisEngine.tanks = [];
        thisEngine.timeEvents = [];

        Common.getRequest("/singlePlayer/getTankTypes", function (data) {
            thisEngine.tankTypes = data;
            thisEngine.loadMapDetail(function () {
                Resource.getRoot().processSocketMessage({
                    messageType: "MAP",
                    message: thisEngine.mapInfo
                });

                thisEngine.addTimeEvent(Math.random() * 60 * 3 + 60,function () {

                });

                Resource.getRoot().processSocketMessage({
                    messageType: "SERVER_READY"
                })
            })
        })
    }

    loadMapDetail(callback) {
        const thisEngine = this;
        Common.getRequest("/singlePlayer/getMapFromId?id=" + this.room.roomInfo.mapId, function (data) {
            thisEngine.mapInfo = data;
            callback();
        });
    }

    update() {
        this.updateTimeEvents();
        super.update();
    }

    updateTimeEvents() {
        for (let i = 0; i < this.timeEvents.length; ++i) {
            const event = this.timeEvents[i];
            if (event.timeout > 0) {
                --event.timeout;
                continue;
            }

            event.callback();
            this.timeEvents.splice(i, 1);
            --i;
        }
    }

    addTimeEvent(timeout, callback) {
        const event = {};
        event.timeout = timeout;
        event.callback = callback;
        this.timeEvents.push(event);
    }
}