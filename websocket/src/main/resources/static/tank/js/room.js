{
    function Room() {
        this.stage = null;
        this.roomInfo = null;
    }

    Room.getOrCreateRoom = function (roomInfo) {
        if (this.stage) {
            return this.stage;
        }

        //init room
        this.stage = Resource.getGame().createStage();
        const thisRoom = this;
        const thisStage = thisRoom.stage;

        thisRoom.roomInfo = roomInfo;
        this.stage.receiveStompMessageExtension = function (messageDto) {
            switch (messageDto.messageType) {
                case "MAP":
                    loadMap(thisRoom, messageDto.message);
                    break;
                default:
                    break;
            }
        };

        //显示基本信息
        drawTips(thisStage, '房间号:' + roomInfo.roomId
            + " 地图:" + roomInfo.mapId
            + " [" + roomInfo.roomType + "]",
            10, 6);
    };

    /**
     *
     * @param room
     * @param data {{itemList,width,height,playerLife,computerLife}}
     */
    const loadMap = function (room, data) {
        room.roomInfo.width = data.width;
        room.roomInfo.height = data.height;
        room.roomInfo.playerLife = data.playerLife;
        room.roomInfo.computerLife = data.computerLife;
        if (room.roomInfo.roomType === 'PVE') {
            drawTips(room.stage, "玩家生命:" + room.roomInfo.playerLife,
                10, 24, "red_team_life");
            drawTips(room.stage, "电脑生命:" + room.roomInfo.computerLife,
                10, 40, "red_team_life");
        } else {
            drawTips(room.stage, "红队生命:" + room.roomInfo.playerLife,
                10, 24, "blue_team_life");
            drawTips(room.stage, "蓝队生命:" + room.roomInfo.computerLife,
                10, 40, "blue_team_life");
        }

        //load mapItem
        data.itemList.forEach(function (itemData) {
            createOrUpdateMapItem(room.stage, itemData);
        })

    };

    const _unitSize = 36;

    const createOrUpdateMapItem = function (stage, data) {
        let item;
        if (stage.items.has(data.id)) {
            item = stage.items.get(data.id);
        } else {
            item = stage.createItem({id:data.id});
        }

        const typeId = data.typeId.toLowerCase();
        item.image = Resource.getImage(typeId);

        const position = getPositionFromId(data.id);
        item.x = position.x;
        item.y = position.y;

        //调整z值和动画
        switch (typeId) {
            case "grass":
                item.z = 5;
                break;
            case "river":
            case "red_king":
            case "blue_king":
                const thisItem = item;
                item.play = new Play(1,30,
                    function () {
                        thisItem.orientation = (thisItem.orientation + 1) % 2;
                    },function () {
                        this.frames = 1;
                    })
        }
    };

    const getPositionFromId = function(id) {
        const position = {};
        const infos = id.split("_");
        position.x = parseInt(infos[0]) * _unitSize + _unitSize / 2;
        position.y = parseInt(infos[1]) * _unitSize + _unitSize / 2;
        return position;
    };

    const drawTips = function (stage, tips, x, y, id) {
        if (id === undefined) {
            id = Resource.getId();
        }

        if (stage.items.has(id)) {
            return;
        }

        stage.createItem({
            id: id,
            draw: function (context) {
                context.font = '14px Helvetica';
                context.textAlign = 'left';
                context.textBaseline = 'top';
                context.fillStyle = '#AAA';
                context.fillText(tips, x, y);
            }
        });
    }
}