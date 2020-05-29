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
                case "ITEM":
                    createGameItem(thisStage, messageDto.message);
                    break;
                case "REMOVE_ITEM":
                    thisStage.removeItem(messageDto.message);
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
        thisStage.createTankExtension = function (item) {
            reloadCreateTankExtension(thisRoom, item)
        };

        //显示基本信息
        thisRoom.drawTitle(thisStage);
    };

    const reloadCreateTankExtension = function (thisRoom, item) {
        if (thisRoom.roomInfo.roomType === "PVE" && item.teamId === 2) {
            item.showId = false;
            return;
        }

        if (thisRoom.roomInfo.roomType === "EVE") {
            item.showId = false;
        }
    };

    const reloadSetControl = function (room, orientation, action) {
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
            room.drawTips("蓝队剩余生命:" + room.roomInfo.computerLife,
                10, 40, "blue_team_life");
        }

        //load mapItem
        if (data.itemList) {
            data.itemList.forEach(function (itemData) {
                createOrUpdateMapItem(room.stage, itemData);
            })
        }
    };

    const createOrUpdateMapItem = function (stage, data) {

    };
}