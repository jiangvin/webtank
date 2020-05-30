//资源类
{
    function Resource() {
        this.game = null;
        this.images = null;

        //id生成器
        this.id = null;
        this.stompClient = null;

        this.username = null;

        this.scale = null;
    }

    Resource.getScale = function () {
        return this.scale;
    };

    Resource.calculateScale = function (d1, d2) {
        let width;
        let height;
        if (d1 > d2) {
            width = d1;
            height = d2;
        } else {
            width = d2;
            height = d1;
        }
        let scaleX = width / 800;
        let scaleY = height / 500;
        this.scale = scaleX > scaleY ? scaleY : scaleX;
        this.scale = this.scale < 1 ? this.scale : 1;
        return this.scale;
    };

    Resource.getImages = function () {
        if (this.images) {
            return this.images;
        }
    };


    Resource.getImage = function (id, type, widthPics, heightPics) {
        if (id === "tankMenu") {
            return Common.getRandomTankImage();
        }
    };

    Resource.getGame = function () {
        if (this.game) {
            return this.game;
        }

        //初始化
        this.game = new Game("canvas");

        return this.game;
    };

    Resource.getId = function () {
        if (!this.id) {
            this.id = 1;
        }
        return "generatedClientId=" + this.id++;
    };

    Resource.getSelect = function (optionValues, optionTexts) {
        const select = document.createElement('select');
        for (let i = 0; i < optionValues.length; ++i) {
            const option = document.createElement('option');
            option.value = optionValues[i];
            if (optionTexts && optionTexts[i]) {
                option.text = optionTexts[i];
            } else {
                option.text = optionValues[i];
            }
            select.add(option);
        }
        return select;
    };

    Resource.setStompClient = function (stompClient) {
        this.stompClient = stompClient;
    };

    Resource.getStompInfo = function () {
        if (!Resource.getStompClient()) {
            return null;
        }
        const stompInfo = {};
        const url = Resource.getStompClient().ws._transport.url;
        stompInfo.username = decodeURI(url.substring(url.lastIndexOf("=") + 1));

        //get socket session id
        const end = url.lastIndexOf("/");
        const start = url.substring(0, end).lastIndexOf("/");
        stompInfo.socketSessionId = url.substring(start + 1, end);
        return stompInfo;
    };

    Resource.getStompClient = function () {
        return this.stompClient;
    };

    Resource.getUnitSize = function () {
        return 36;
    };

    Resource.getUsername = function () {
        if (this.username) {
            return this.username;
        }

        const stompInfo = Resource.getStompInfo();
        if (!stompInfo) {
            return null;
        }

        this.username = stompInfo.username;
        return this.username;
    }
}