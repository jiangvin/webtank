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

    const loadMap = function (room, data) {
        room.roomInfo.width = data.width;
        room.roomInfo.height = data.height;
        room.roomInfo.playerLife = data.playerLife;
        room.roomInfo.computerLife = data.computerLife;

        if (room.roomInfo.roomType === 'PVE') {
            drawTips(room.stage, "玩家生命:" + room.roomInfo.playerLife,
                10, 24);
            drawTips(room.stage, "电脑生命:" + room.roomInfo.computerLife,
                10, 40);
        } else {
            drawTips(room.stage, "红队生命:" + room.roomInfo.playerLife,
                10, 24);
            drawTips(room.stage, "蓝队生命:" + room.roomInfo.computerLife,
                10, 40);
        }
    };

    const drawTips = function (stage, tips, x, y) {
        stage.createItem({
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