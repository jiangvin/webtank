/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/21
 */

import Manager from "./manager.js";
import Status from "../../../tool/status.js";
import Connect from "../../../tool/connect.js";

export default class NetManager extends Manager {
    constructor(room) {
        super(room);

        this.showFaceRect = false;

        this.faceInfo = {
            size: 120,
            interval: 150,
            x: -510,
            y: 240,
        }
    }

    generateInfoUnits() {
        const units = super.generateInfoUnits();
        //新增房间信息
        units[units.length] = {
            icon: "room",
            info: this.room.roomInfo.roomId
        };
        return units;
    }

    drawRoomInfo(ctx) {
        super.drawRoomInfo(ctx);
        this.drawFaceButton(ctx);
    }

    drawFaceButton(ctx) {
        ctx.displayTopLeft(
            "face01",
            -150,
            540,
            120);
        this.drawFaceRect(ctx);
    }

    drawFaceRect(ctx) {
        if (!this.showFaceRect) {
            return;
        }

        ctx.displayTopLeft(
            "face_rect",
            -595, 175,
            600, 500
        );

        const startX = this.faceInfo.x;
        const startY = this.faceInfo.y;
        for (let i = 0; i < 6; ++i) {
            const x = startX + (i % 3) * this.faceInfo.interval;
            const y = startY + Math.floor(i / 3) * this.faceInfo.interval;
            ctx.displayTopLeft(
                "face0" + (i + 1),
                x, y,
                this.faceInfo.size, this.faceInfo.size
            );
        }
    }

    createControlEvent() {
        super.createControlEvent();
        this.createFaceControl();
    }

    createFaceControl() {
        const thisRoom = this.room;
        thisRoom.createControl({
            leftTop: {
                x: -150,
                y: 540
            },
            size: {
                w: 120,
                h: 120
            },
            needOffset: false,
            callback: () => {
                if (!Status.isGaming()) {
                    return;
                }

                this.changeFaceEvent();
            }
        })
    }

    changeFaceEvent() {
        this.showFaceRect = !this.showFaceRect;

        const manager = this;
        const room = this.room;
        if (this.showFaceRect) {
            for (let i = 0; i < 6; ++i) {
                room.createControl({
                    id: "face0" + (i + 1),
                    leftTop: {
                        x: this.faceInfo.x + (i % 3) * this.faceInfo.interval,
                        y: this.faceInfo.y + Math.floor(i / 3) * this.faceInfo.interval
                    },
                    size: {
                        w: this.faceInfo.size,
                        h: this.faceInfo.size
                    },
                    needOffset: false,
                    callback: function () {
                        Connect.send("FACE", this.id);
                        manager.changeFaceEvent();
                    }
                })
            }
        } else {
            for (let i = 0; i < 6; ++i) {
                room.removeControlFromId("face0" + (i + 1));
            }
        }
    }
}