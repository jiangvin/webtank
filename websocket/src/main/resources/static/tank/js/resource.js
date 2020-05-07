//资源类
{
    function Resource() {
        this.game = null;
        this.images = null;
        this.id = null;
        this.stompClient = null;
    }

    Resource.getImages = function () {
        if (this.images) {
            return this.images;
        }

        this.images = [];

        //加载初始资源
        const img = document.createElement('img');
        img.src = 'tank/image/tank01.png';
        img.widthPics = 4;
        img.heightPics = 1;
        img.displayWidth = img.width / img.widthPics;
        img.displayHeight = img.height / img.heightPics;
        this.images['tank01'] = img;

        return this.images;
    };

    Resource.getImage = function (id, widthPics, heightPics) {
        const images = Resource.getImages();
        if (!images[id]) {
            widthPics = widthPics ? widthPics : 1;
            heightPics = heightPics ? heightPics : 1;
            const img = document.createElement('img');
            img.src = 'tank/image/' + id + ".png";
            img.widthPics = widthPics;
            img.heightPics = heightPics;
            img.displayWidth = img.width / img.widthPics;
            img.displayHeight = img.height / img.heightPics;
            images[id] = img;
        }
        return images[id];
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
}