//资源类
{
    function Resource() {
        this.game = null;
        this.images = null;

        //id生成器
        this.id = null;
        this.stompClient = null;
        this.tankTypes = null;
    }

    Resource.getImages = function () {
        if (this.images) {
            return this.images;
        }

        this.images = new Map();


        //load all tank images
        for (let i = 1; i <= 12; ++i) {
            let id;
            if (i < 10) {
                id = "tank0" + i;
            } else {
                id = "tank" + i;
            }
            loadOrientationImage(id, this.images);
        }
        loadOrientationImage("ammo", this.images);
        return this.images;
    };

    const loadOrientationImage = function (imageId, images) {
        const img = document.createElement('img');
        img.src = 'tank/image/' + imageId + '.png';
        img.widthPics = 4;
        img.heightPics = 1;
        img.displayWidth = img.width / img.widthPics;
        img.displayHeight = img.height / img.heightPics;
        images.set(imageId, img);
    };

    Resource.getImage = function (id, widthPics, heightPics) {
        const images = Resource.getImages();
        if (!images.has(id)) {
            widthPics = widthPics ? widthPics : 1;
            heightPics = heightPics ? heightPics : 1;
            const img = document.createElement('img');
            img.src = 'tank/image/' + id + ".png";
            img.widthPics = widthPics;
            img.heightPics = heightPics;
            img.displayWidth = img.width / img.widthPics;
            img.displayHeight = img.height / img.heightPics;
            images.set(id, img);
        }
        return images.get(id);
    };

    Resource.getGame = function () {
        if (this.game) {
            return this.game;
        }

        //初始化
        this.game = new Game("canvas");

        //在手机上禁用滑动
        window.addEventListener('touchmove', function (e) {
            // 判断默认行为是否可以被禁用
            if (e.cancelable) {
                // 判断默认行为是否已经被禁用
                if (!e.defaultPrevented) {
                    e.preventDefault();
                }
            }
        }, false);

        return this.game;
    };

    Resource.getId = function () {
        if (!this.id) {
            this.id = 1;
        }
        return "generatedId=" + this.id++;
    };

    Resource.getSelect = function (options) {
        const select = document.createElement('select');
        options.forEach(function (optionText) {
            const option = document.createElement('option');
            option.text = optionText;
            select.add(option);
        });
        return select;
    };

    Resource.setStompClient = function (stompClient) {
        this.stompClient = stompClient;
    };

    Resource.getStompClient = function () {
        return this.stompClient;
    };

    Resource.setTankTypes = function (dataList) {
        const types = new Map();
        /**
         * @param data {{typeId,speed,ammoSpeed}}
         */
        dataList.forEach(function (data) {
            types.set(data.typeId, data);
        });
        this.tankTypes = types;
    };

    Resource.getTankType = function (id) {
        return this.tankTypes.get(id);
    }
}