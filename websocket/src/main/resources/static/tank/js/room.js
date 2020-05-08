{
    function Room() {
        this.stage = null;
    }

    Room.getOrCreateRoom = function () {
        if (this.stage) {
            return this.stage;
        }

        //init room
        this.stage = Resource.getGame().createStage();
    }
}