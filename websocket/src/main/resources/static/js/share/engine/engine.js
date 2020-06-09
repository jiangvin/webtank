/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/28
 */

import Status from "../tool/status.js";
import Common from "../tool/common.js";
import Resource from "../tool/resource.js";

export default class Engine {
    constructor(room) {
        this.room = room;

        //连接超时调用
        Common.addConnectTimeoutEvent(function () {
            Common.lastStage();
            Resource.getRoot().currentStage().resetButtons();
        });
    }

    update() {
        this.updateCenter(this.room)
    }

    updateCenter(room) {
        const center = room.view.center;
        if (center === null) {
            return;
        }
        if (center.action === 0) {
            return;
        }

        let needSend = false;
        const cache = room.control.cache;
        if (cache && cache.x && cache.y) {
            const distance = Common.distance(center.x, center.y, cache.x, cache.y);
            if (distance > center.speed) {
                return;
            }

            //清空缓存
            center.x = cache.x;
            center.y = cache.y;
            room.control.cache = null;
            center.orientation = room.control.orientation;
            needSend = true;
        }

        const newControl = this.generateNewControl(room, room.view.center, center.orientation, center.action);
        if (!newControl.action) {
            //不能通行
            center.action = 0;
            needSend = true;
        } else if (newControl.cache) {
            //能通行,但要更新缓存
            room.control.cache = newControl.cache;
            if (center.orientation !== room.control.cache.orientation) {
                center.orientation = room.control.cache.orientation;
                needSend = true;
            }
        }

        if (needSend) {
            this.sendSyncMessage(room.send, center);
        }
    }

    processControlEvent(event) {
        this.controlTank(event);
        this.controlView(event);
    }

    controlTank(event) {
        switch (event) {
            case "Up":
                this.setControl(0, 1);
                break;
            case "Down":
                this.setControl(1, 1);
                break;
            case "Left":
                this.setControl(2, 1);
                break;
            case "Right":
                this.setControl(3, 1);
                break;
            case "Stop":
                this.setControl(null, 0);
        }
    }

    controlView(event) {
        if (this.room.view.center !== null && Status.getValue() !== Status.statusPause()) {
            return;
        }

        if (!this.room.size.width || !this.room.size.height) {
            return;
        }

        const speed = 5.0;
        switch (event) {
            case "Up":
                if (this.room.size.height > Common.height()) {
                    this.room.view.y = this.room.view.y > speed ? this.room.view.y - speed : 0;
                }
                break;
            case "Down":
                if (this.room.size.height > Common.height()) {
                    const maxY = this.room.size.height - Common.height();
                    this.room.view.y = this.room.view.y + speed < maxY ? this.room.view.y + speed : maxY;
                }
                break;
            case "Left":
                if (this.room.size.width > Common.width()) {
                    this.room.view.x = this.room.view.x > speed ? this.room.view.x - speed : 0;
                }
                break;
            case "Right":
                if (this.room.size.width > Common.width()) {
                    const maxX = this.room.size.width - Common.width();
                    this.room.view.x = this.room.view.x + speed < maxX ? this.room.view.x + speed : maxX;
                }
                break;
        }
    }

    setControl(orientation, action) {
        const center = this.room.view.center;
        if (center === null) {
            return;
        }
        if (orientation === null) {
            orientation = center.orientation;
        }
        const room = this.room;
        const newControl = this.generateNewControl(room, room.view.center, orientation, action);
        //新命令和旧命令一样，返回
        if (newControl.action === room.control.action && newControl.orientation === room.control.orientation) {
            return;
        }

        room.control = newControl;
        center.action = newControl.action;
        if (newControl.cache) {
            center.orientation = newControl.cache.orientation;
        } else {
            center.orientation = newControl.orientation;
        }
        this.sendSyncMessage(room.send, center);
    }

    /**
     * 在netEngine中重载
     * @param send
     * @param center
     */
    sendSyncMessage(send, center) {
    };

    generateNewControl(stage, tank, orientation, action) {
        const newControl = {
            orientation: orientation,
            action: 0
        };
        if (action === 0) {
            return newControl;
        }

        //action为1，开始碰撞检测
        let x = tank.x;
        let y = tank.y;
        const speed = tank.speed;
        const size = Resource.getUnitSize();
        const half = size / 2;
        const halfLight = half - 1;
        //获取前方的两个角的坐标（顺时针获取）
        const corner1 = {};
        const corner2 = {};
        switch (orientation) {
            case 0:
                y -= speed;
                corner1.x = x - halfLight;
                corner1.y = y - halfLight;
                corner2.x = x + halfLight;
                corner2.y = y - halfLight;
                break;
            case 1:
                y += speed;
                corner1.x = x + halfLight;
                corner1.y = y + halfLight;
                corner2.x = x - halfLight;
                corner2.y = y + halfLight;
                break;
            case 2:
                x -= speed;
                corner1.x = x - halfLight;
                corner1.y = y + halfLight;
                corner2.x = x - halfLight;
                corner2.y = y - halfLight;
                break;
            case 3:
                x += speed;
                corner1.x = x + halfLight;
                corner1.y = y - halfLight;
                corner2.x = x + halfLight;
                corner2.y = y + halfLight;
                break;
        }

        corner1.isBarrier = this.isBarrier(stage, corner1);
        corner2.isBarrier = this.isBarrier(stage, corner2);

        //两个边界都有阻碍，返回
        if (corner1.isBarrier && corner2.isBarrier) {
            return newControl;
        }

        newControl.action = 1;
        //两个边界都没阻碍，返回
        if (!corner1.isBarrier && !corner2.isBarrier) {
            return newControl;
        }

        //增加中转点(单边阻碍的情况)
        const transferGrid = {};
        newControl.cache = {};
        switch (orientation) {
            case 0:
                if (corner1.isBarrier) {
                    newControl.cache.orientation = 3;
                    transferGrid.gridX = corner2.gridX;
                    transferGrid.gridY = corner2.gridY + 1;
                } else {
                    newControl.cache.orientation = 2;
                    transferGrid.gridX = corner1.gridX;
                    transferGrid.gridY = corner1.gridY + 1;
                }
                break;
            case 1:
                if (corner1.isBarrier) {
                    newControl.cache.orientation = 2;
                    transferGrid.gridX = corner2.gridX;
                    transferGrid.gridY = corner2.gridY - 1;
                } else {
                    newControl.cache.orientation = 3;
                    transferGrid.gridX = corner1.gridX;
                    transferGrid.gridY = corner1.gridY - 1;
                }
                break;
            case 2:
                if (corner1.isBarrier) {
                    newControl.cache.orientation = 0;
                    transferGrid.gridX = corner2.gridX + 1;
                    transferGrid.gridY = corner2.gridY;
                } else {
                    newControl.cache.orientation = 1;
                    transferGrid.gridX = corner1.gridX + 1;
                    transferGrid.gridY = corner1.gridY;
                }
                break;
            case 3:
                if (corner1.isBarrier) {
                    newControl.cache.orientation = 1;
                    transferGrid.gridX = corner2.gridX - 1;
                    transferGrid.gridY = corner2.gridY;
                } else {
                    newControl.cache.orientation = 0;
                    transferGrid.gridX = corner1.gridX - 1;
                    transferGrid.gridY = corner1.gridY;
                }
                break;
        }
        newControl.cache.x = transferGrid.gridX * size + half;
        newControl.cache.y = transferGrid.gridY * size + half;
        return newControl;
    };

    isBarrier(stage, point) {
        if (point.x < 0 || point.y < 0 || point.x > stage.size.width || point.y > stage.size.height) {
            return true;
        }
        const size = Resource.getUnitSize();
        point.gridX = Math.floor(point.x / size);
        point.gridY = Math.floor(point.y / size);
        let key = point.gridX + "_" + point.gridY;
        return stage.items.has(key) && stage.items.get(key).isBarrier;

    };
}