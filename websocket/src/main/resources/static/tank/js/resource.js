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

        this.images = new Map();


        //load all tank images
        for (let i = 1; i <= 12; ++i) {
            let id;
            if (i < 10) {
                id = "tank0" + i;
            } else {
                id = "tank" + i;
            }
            loadAnimationImage(id, this.images, 4);
        }

        //animation
        loadAnimationImage("shield", this.images, 4);
        loadAnimationImage("bomb", this.images, 6);

        //item
        loadAnimationImage("item_star", this.images, 2);
        loadAnimationImage("item_shield", this.images, 2);
        loadAnimationImage("item_red_star", this.images, 2);

        //map unit
        loadAnimationImage("bullet", this.images, 4);
        loadAnimationImage("brick", this.images, 2);
        loadAnimationImage("iron", this.images, 2);
        loadAnimationImage("river", this.images, 2);
        loadAnimationImage("red_king", this.images, 2);
        loadAnimationImage("blue_king", this.images, 2);
        return this.images;
    };

    const loadAnimationImage = function (imageId, images, widthPics) {
        const img = document.createElement('img');
        img.src = 'tank/image/' + imageId + '.png';
        img.widthPics = widthPics;
        img.heightPics = 1;
        img.displayWidth = img.width / img.widthPics;
        img.displayHeight = img.height / img.heightPics;
        images.set(imageId, img);
    };

    Resource.getImage = function (id, type, widthPics, heightPics) {
        if (id === "tankMenu") {
            return Common.getRandomTankImage();
        }

        const images = Resource.getImages();
        if (!images.has(id)) {
            widthPics = widthPics ? widthPics : 1;
            heightPics = heightPics ? heightPics : 1;
            const img = document.createElement('img');
            if (!type) {
                type = "png";
            }
            img.src = 'tank/image/' + id + '.' + type;
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
        window.addEventListener('touchstart', function (e) {
            if (e.touches.length > 1) {
                // 判断默认行为是否可以被禁用
                if (e.cancelable) {
                    // 判断默认行为是否已经被禁用
                    if (!e.defaultPrevented) {
                        e.preventDefault();
                    }
                }
            }
        });
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (e) {
            let now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                // 判断默认行为是否可以被禁用
                if (e.cancelable) {
                    // 判断默认行为是否已经被禁用
                    if (!e.defaultPrevented) {
                        e.preventDefault();
                    }
                }
            }
            lastTouchEnd = now;
        }, false);
        document.addEventListener('gesturestart', function (e) {
            // 判断默认行为是否可以被禁用
            if (e.cancelable) {
                // 判断默认行为是否已经被禁用
                if (!e.defaultPrevented) {
                    e.preventDefault();
                }
            }
        });

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