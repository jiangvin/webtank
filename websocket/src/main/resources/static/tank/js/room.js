{
    function Room() {
        this.stage = null;
        this.roomInfo = null;
    }

    let centerSyncInfo = {};

    Room.getOrCreateRoom = function (roomInfo) {
        if (this.stage) {
            return this.stage;
        }

        //init room
        this.stage = Resource.getGame().createStage({id: roomInfo.roomId});
        this.roomInfo = roomInfo;
        this.stage.backgroundImage = Resource.getImage("background", "jpg");
        if (this.roomInfo.roomType !== "PVE") {
            this.stage.showTeam = true;
        }

        const thisRoom = this;
        const thisStage = thisRoom.stage;

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
                default:
                    break;
            }
        };

        //扩展控制
        thisStage.updateCenter = function () {
            updateCenter(thisStage);
        };

        //显示基本信息
        const tipMessage = '房间号:' + roomInfo.roomId + " 地图:" + roomInfo.mapId + " [" + roomInfo.roomType + "]";
        drawTips(thisStage, tipMessage, 10, 6);
    };


    const updateCenter = function (stage) {
        const center = stage.view.center;
        if (!center) {
            return;
        }

        const control = stage.control;
        if (center.orientation === control.orientation && center.action === control.action) {
            center.update();
            return;
        }

        const size = Resource.getUnitSize();
        const centerGrid = {
            x: Math.floor(center.x / size),
            y: Math.floor(center.y / size)
        };
        const destination = {
            x: centerGrid.x * size + size / 2,
            y: centerGrid.y * size + size / 2,
        };

        if (center.action === 1) {
            switch (center.orientation) {
                case 0:
                    if (center.y <= destination.y) {
                        destination.y -= size;
                    }
                    break;
                case 1:
                    if (center.y >= destination.y) {
                        destination.y += size;
                    }
                    break;
                case 2:
                    if (center.x <= destination.x) {
                        destination.x -= size;
                    }
                    break;
                case 3:
                    if (center.x >= destination.x) {
                        destination.x += size;
                    }
                    break;
            }
        }

        const distance = Common.distance(center.x, center.y, destination.x, destination.y);
        const speed = center.speed;
        if (distance > speed) {
            center.update();
            return;
        }

        //先移动到屏幕中心
        center.speed = distance;
        center.update();
        center.speed = speed;
        center.orientation = control.orientation;
        center.action = control.action;

        //再看新目的地
        if (control.action === 1) {
            const destinationGrid = {
                x: Math.floor(destination.x / size),
                y: Math.floor(destination.y / size)
            };
            switch (control.orientation) {
                case 0:
                    --destinationGrid.y;
                    break;
                case 1:
                    ++destinationGrid.y;
                    break;
                case 2:
                    --destinationGrid.x;
                    break;
                case 3:
                    ++destinationGrid.x;
                    break;
            }
            if (destinationGrid.x < 0 || destinationGrid.y < 0) {
                center.action = 0;
            } else {
                const key = destinationGrid.x + "_" + destinationGrid.y;
                if (stage.items.has(key) && stage.items.get(key).isBarrier) {
                    center.action = 0;
                }
            }
            sendSyncInfo(center);
        }
    };

    const sendSyncInfo = function (center) {
        if (center.x === centerSyncInfo.x
            && center.y === centerSyncInfo.y
            && center.orientation === centerSyncInfo.orientation
            && center.action === centerSyncInfo.action) {
            return;
        }

        Common.sendStompMessage({
            orientation: center.orientation,
            action: center.action,
            x: center.x,
            y: center.y
        }, "UPDATE_TANK_CONTROL");

        centerSyncInfo.x = center.x;
        centerSyncInfo.y = center.y;
        centerSyncInfo.orientation = center.orientation;
        centerSyncInfo.action = center.action;

    };

    /**
     *
     * @param room
     * @param data {{itemList,width,height,playerLife,computerLife}}
     */
    const loadMap = function (room, data) {
        if (data.playerLife !== undefined) {
            room.roomInfo.playerLife = data.playerLife;
        }
        if (data.computerLife !== undefined) {
            room.roomInfo.computerLife = data.computerLife;
        }
        if (data.width) {
            room.stage.size.width = data.width;
        }
        if (data.height) {
            room.stage.size.height = data.height;
        }
        if (room.roomInfo.roomType === 'PVE') {
            drawTips(room.stage, "玩家生命:" + room.roomInfo.playerLife,
                10, 24, "red_team_life");
            drawTips(room.stage, "电脑生命:" + room.roomInfo.computerLife,
                10, 40, "blue_team_life");
        } else {
            drawTips(room.stage, "红队生命:" + room.roomInfo.playerLife,
                10, 24, "red_team_life");
            drawTips(room.stage, "蓝队生命:" + room.roomInfo.computerLife,
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
        if (typeId !== "grass") {
            item.isBarrier = true;
        }
    };

    const setResourceImage = function (item, typeId) {
        switch (typeId) {
            case "broken_brick":
                item.image = Resource.getImage("brick");
                item.orientation = 1;
                break;
            case "broken_iron":
                item.image = Resource.getImage("iron");
                item.orientation = 1;
                break;
            default:
                item.image = Resource.getImage(typeId);
                item.orientation = 0;
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

        const typeId = data.typeId.toLowerCase();
        setResourceImage(item, typeId);
        setBarrier(item, typeId);
        const position = getPositionFromId(data.id);
        item.x = position.x;
        item.y = position.y;

        //调整z值
        if (typeId === "grass") {
            item.z = 2;
        } else if (typeId === "river") {
            item.z = -4;
        }

        //播放动画
        switch (typeId) {
            case "river":
            case "red_king":
            case "blue_king":
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

    const drawTips = function (stage, tips, x, y, id) {
        if (id === undefined) {
            id = Resource.getId();
        }

        if (stage.items.has(id)) {
            stage.items.get(id).draw = function (context) {
                context.font = '14px Helvetica';
                context.textAlign = 'left';
                context.textBaseline = 'top';
                context.fillStyle = '#ffffff';
                context.fillText(tips, x, y);
            }
        } else {
            stage.createItem({
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