{
    function Room() {
        this.stage = null;
    }

    Room.getOrCreateRoom = function (roomInfo) {
        if (this.stage) {
            return this.stage;
        }

        //init room
        this.stage = Resource.getGame().createStage();
        this.stage.createItem({
            draw: function (context) {
                context.font = '14px Helvetica';
                context.textAlign = 'left';
                context.textBaseline = 'top';
                context.fillStyle = '#AAA';
                context.fillText('房间号:' + roomInfo.roomId
                    + " 地图:" + roomInfo.mapId
                    + " [" + roomInfo.roomType + "]", 10, 6);
            }
        });
    }
}