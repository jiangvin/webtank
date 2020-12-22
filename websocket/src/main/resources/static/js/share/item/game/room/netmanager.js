/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/21
 */

import Manager from "./manager.js";
import Resource from "../../../tool/resource.js";
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

    drawRoomInfo(ctx) {
        super.drawRoomInfo(ctx);
        this.drawFaceButton(ctx);
    }

    drawFaceButton(ctx) {
        const face = Resource.getImage("face01");
        ctx.drawImage(
            face,
            0, 0,
            face.width, face.height,
            Resource.width() - 150, 540,
            120, 120
        );

        this.drawFaceRect(ctx);
    }

    drawFaceRect(ctx) {
        if (!this.showFaceRect) {
            return;
        }

        const rect = Resource.getImage("face_rect");
        ctx.drawImage(
            rect,
            0, 0,
            rect.width, rect.height,
            Resource.width() - 595, 175,
            600, 500
        );

        const startX = Resource.width() + this.faceInfo.x;
        const startY = this.faceInfo.y;
        for (let i = 0; i < 6; ++i) {
            const img = Resource.getImage("face0" + (i + 1));
            const x = startX + (i % 3) * this.faceInfo.interval;
            const y = startY + Math.floor(i / 3) * this.faceInfo.interval;
            ctx.drawImage(
                img,
                0, 0,
                img.width, img.height,
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
            callBack: () => {
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
                    callBack: function () {
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