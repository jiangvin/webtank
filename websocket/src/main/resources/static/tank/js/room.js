{
    function Room(roomInfo) {
        this.instance = null;

        this.roomInfo = roomInfo;
        this.stage = null;

        this.control = {
            orientation: 0,
            action: 0,
            cache: {}
        };

        this.send = {
            orientation: 0,
            action: 0,
            x: 0,
            y: 0
        };

        this.drawTitle = function () {
            //显示基本信息
            const tipMessage = '房间号:' + this.roomInfo.roomId
                + " 地图:" + this.roomInfo.mapId + " [" + this.roomInfo.roomType + "]";
            this.drawTips(tipMessage, 10, 6, "ROOM_TITLE");
        };

        this.drawTips = function (tips, x, y, id) {
            if (id === undefined) {
                id = Resource.getId();
            }

            if (this.stage.items.has(id)) {
                this.stage.items.get(id).draw = function (context) {
                    context.font = '14px Helvetica';
                    context.textAlign = 'left';
                    context.textBaseline = 'top';
                    context.fillStyle = '#ffffff';
                    context.fillText(tips, x, y);
                }
            } else {
                this.stage.createItem({
                    id: id,
                    z: 8,
                    draw: function (context) {
                        context.font = '14px Helvetica';
                        context.textAlign = 'left';
                        context.textBaseline = 'top';
                        context.fillStyle = '#ffffff';
                        context.fillText(tips, x, y);
                    }
                });
            }

        }
    }

    Room.getOrCreateRoom = function (roomInfo) {
        if (this.instance) {
            return this.instance;
        }

        //init room
        this.instance = new Room(roomInfo);
        this.instance.stage = Resource.getGame().createStage({id: roomInfo.roomId});
        const thisRoom = this.instance;
        const thisStage = thisRoom.stage;

        //因为延迟问题采用本地同步远端的设计，增加操控体验
        thisStage.updateSelf = false;
        thisStage.backgroundImage = Resource.getImage("background", "jpg");
        if (thisRoom.roomInfo.roomType !== "PVE") {
            thisStage.showTeam = true;
        }

        //扩展消息函数
        thisStage.receiveStompMessageExtension = function (messageDto) {
            switch (messageDto.messageType) {
                case "MAP":
                    loadMap(thisRoom, messageDto.message);
                    thisStage.sortItems();
                    break;
                case "REMOVE_MAP":
                    thisStage.itemBomb({id: messageDto.message});
                    break;
                case "CLEAR_MAP":
                    thisStage.items.clear();
                    thisStage.view.center = null;
                    break;
                default:
                    break;
            }
        };

        //重载控制函数
        thisStage.setControl = function (orientation, action) {
            reloadSetControl(thisRoom, orientation, action);
        };
        thisStage.updateCenter = function () {
            reloadUpdateCenter(thisRoom);
        };
        thisStage.createTankExtension = function(item) {
            reloadCreateTankExtension(thisRoom,item)
        };

        //显示基本信息
        thisRoom.drawTitle(thisStage);
    };

    const reloadCreateTankExtension = function (thisRoom,item) {
        if (thisRoom.roomInfo.roomType === "PVE" && item.teamId === 2) {
            item.showId = false;
            return;
        }

        if (thisRoom.roomInfo.roomType === "EVE") {
            item.showId = false;
        }
    };

    const reloadUpdateCenter = function (room) {
        const center = room.stage.view.center;
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

        const newControl = generateNewControl(room.stage, center.orientation, center.action);
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
            sendSyncMessage(room.send, center);
        }
    };

    const reloadSetControl = function (room, orientation, action) {
        const center = room.stage.view.center;
        if (center === null) {
            return;
        }
        if (orientation === null) {
            orientation = center.orientation;
        }
        const newControl = generateNewControl(room.stage, orientation, action);

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
        sendSyncMessage(room.send, center);
    };

    const isBarrier = function (stage, point) {
        if (point.x < 0 || point.y < 0 || point.x > stage.size.width || point.y > stage.size.height) {
            return true;
        }
        const size = Resource.getUnitSize();
        point.gridX = Math.floor(point.x / size);
        point.gridY = Math.floor(point.y / size);
        let key = point.gridX + "_" + point.gridY;
        return stage.items.has(key) && stage.items.get(key).isBarrier;

    };

    const generateNewControl = function (stage, orientation, action) {
        const newControl = {
            orientation: orientation,
            action: 0
        };
        if (action === 0) {
            return newControl;
        }
        const center = stage.view.center;

        //action为1，开始碰撞检测
        let x = center.x;
        let y = center.y;
        const speed = center.speed;
        const size = Resource.getUnitSize();
        const half = size / 2;
        //获取前方的两个角的坐标（顺时针获取）
        const corner1 = {};
        const corner2 = {};
        switch (orientation) {
            case 0:
                y -= speed;
                corner1.x = x - half + 1;
                corner1.y = y - half + 1;
                corner2.x = x + half - 1;
                corner2.y = y - half + 1;
                break;
            case 1:
                y += speed;
                corner1.x = x + half - 1;
                corner1.y = y + half - 1;
                corner2.x = x - half + 1;
                corner2.y = y + half - 1;
                break;
            case 2:
                x -= speed;
                corner1.x = x - half + 1;
                corner1.y = y + half - 1;
                corner2.x = x - half + 1;
                corner2.y = y - half + 1;
                break;
            case 3:
                x += speed;
                corner1.x = x + half - 1;
                corner1.y = y - half + 1;
                corner2.x = x + half - 1;
                corner2.y = y + half - 1;
                break;
        }

        corner1.isBarrier = isBarrier(stage, corner1);
        corner2.isBarrier = isBarrier(stage, corner2);

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

    const sendSyncMessage = function (send, center) {
        if (center.x === send.x
            && center.y === send.y
            && center.orientation === send.orientation
            && center.action === send.action) {
            return;
        }
        send.x = center.x;
        send.y = center.y;
        send.orientation = center.orientation;
        send.action = center.action;
        Common.sendStompMessage({
            orientation: send.orientation,
            action: send.action,
            x: send.x,
            y: send.y
        }, "UPDATE_TANK_CONTROL");
    };

    /**
     *
     * @param room
     * @param data {{itemList,width,height,playerLife,computerLife,mapId}}
     */
    const loadMap = function (room, data) {
        if (data.mapId !== undefined) {
            room.roomInfo.mapId = data.mapId;
            room.drawTitle(room.stage);
        }
        if (data.playerLife !== undefined) {
            room.roomInfo.playerLife = data.playerLife;
        }
        if (data.computerLife !== undefined) {
            room.roomInfo.computerLife = data.computerLife;
        }
        if (data.width && data.height) {
            room.stage.size.width = data.width;
            room.stage.size.height = data.height;
            room.stage.calculateBackgroundRepeat();
        }
        if (room.roomInfo.roomType === 'PVE') {
            room.drawTips("玩家剩余生命:" + room.roomInfo.playerLife,
                10, 24, "red_team_life");
            room.drawTips("电脑剩余生命:" + room.roomInfo.computerLife,
                10, 40, "blue_team_life");
        } else {
            room.drawTips("红队剩余生命:" + room.roomInfo.playerLife,
                10, 24, "red_team_life");
            room.drawTips( "蓝队剩余生命:" + room.roomInfo.computerLife,
                10, 40, "blue_team_life");
        }

        //load mapItem
        if (data.itemList) {
            data.itemList.forEach(function (itemData) {
                createOrUpdateMapItem(room.stage, itemData);
            })
        }
    };

    const setBarrier = function (item, typeId) {
        if (typeId !== 5) {
            item.isBarrier = true;
        }
    };

    const setResourceImage = function (item, typeId) {
        switch (typeId) {
            case 0:
                item.image = Resource.getImage("brick");
                break;
            case 1:
                item.image = Resource.getImage("brick");
                item.orientation = 1;
                break;
            case 2:
                item.image = Resource.getImage("iron");
                break;
            case 3:
                item.image = Resource.getImage("iron");
                item.orientation = 1;
                break;
            case 4:
                item.image = Resource.getImage("river");
                break;
            case 5:
                item.image = Resource.getImage("grass");
                break;
            case 6:
                item.image = Resource.getImage("red_king");
                break;
            case 7:
                item.image = Resource.getImage("blue_king");
                break;
        }
    };

    const createOrUpdateMapItem = function (stage, data) {
        let item;
        if (stage.items.has(data.id)) {
            item = stage.items.get(data.id);
        } else {
            item = stage.createItem({id: data.id});
        }

        const typeId = parseInt(data.typeId);
        setResourceImage(item, typeId);
        if (!item.image) {
            return;
        }

        setBarrier(item, typeId);
        const position = getPositionFromId(data.id);
        item.x = position.x;
        item.y = position.y;

        //调整z值
        if (typeId === 5) {
            item.z = 2;
        } else if (typeId === 4) {
            item.z = -4;
        }

        //播放动画
        switch (typeId) {
            case 4:
            case 6:
            case 7:
                item.play = new Play(1, 30,
                    function () {
                        item.orientation = (item.orientation + 1) % 2;
                    }, function () {
                        this.frames = 1;
                    });
                break;
        }
    };

    const getPositionFromId = function (id) {
        const position = {};
        const infos = id.split("_");
        const size = Resource.getUnitSize();
        position.x = parseInt(infos[0]) * size + size / 2;
        position.y = parseInt(infos[1]) * size + size / 2;
        return position;
    };
}