function Stage(params) {

    const thisStage = this;

    this.params = params || {};
    this.settings = {
        showTeam: false,                    //显示团队标志
        id: null,                           //布景id
        items: new Map(),				    //对象队列
        view: {x: 0, y: 0, center: null},   //视野
        size: {width: 0, height: 0},        //场景大小
        backgroundImage: null,              //背景图

        //拓展函数
        receiveStompMessageExtension: function () {
        }
    };
    Common.extend(this, this.settings, this.params);

    //处理控制事件
    this.controlEvent = function (event) {
        if (this.view.center !== null || !this.size.width || !this.size.height) {
            return;
        }

        const speed = 5.0;
        switch (event) {
            case "Up":
                this.view.y = this.view.y > speed ? this.view.y - speed : 0;
                break;
            case "Down":
                const maxY = this.size.height - Common.height();
                this.view.y = this.view.y + speed < maxY ? this.view.y + speed : maxY;
                break;
            case "Left":
                this.view.x = this.view.x > speed ? this.view.x - speed : 0;
                break;
            case "Right":
                const maxX = this.size.width - Common.width();
                this.view.x = this.view.x + speed < maxX ? this.view.x + speed : maxX;
                break;
        }
    };

    this.receiveStompMessage = function (messageDto) {
        //id校验，确保消息正确
        if (!this.id) {
            if (messageDto.roomId) {
                return;
            }
        } else {
            if (!messageDto.roomId || this.id !== messageDto.roomId) {
                return;
            }
        }

        switch (messageDto.messageType) {
            case "TANKS":
                createOrUpdateTanks(thisStage, messageDto.message);
                break;
            case "REMOVE_TANK":
                this.itemBomb(messageDto.message);
                break;
            case "BULLET":
                createOrUpdateBullets(thisStage, messageDto.message);
                break;
            case "REMOVE_BULLET":
                this.itemBomb(messageDto.message, 0.5);
                break;
            default:
                this.receiveStompMessageExtension(messageDto);
                break;
        }
    };

    this.drawBackground = function (context) {
        if (!this.size.width || !this.size.height || !this.backgroundImage) {
            return;
        }

        //TODO - 平铺背景
        const start = this.convertToScreenPoint({x: 0, y: 0});
        context.drawImage(this.backgroundImage,
            0, 0,
            this.backgroundImage.width, this.backgroundImage.height,
            start.x, start.y,
            this.size.width, this.size.height);
    };

    //真实坐标转换屏幕坐标
    this.convertToScreenPoint = function (point) {
        const screenPoint = {};
        screenPoint.x = point.x - this.view.x;
        screenPoint.y = point.y - this.view.y;
        return screenPoint;
    };

    this.draw = function (context) {
        //每秒排序一次
        if (Resource.getGame().frontFrame.totalFrames % 60 === 0) {
            this.sortItems();
        }

        this.updateView();
        this.drawBackground(context);
        this.items.forEach(function (item) {
            item.draw(context);
        });
    };

    this.updateView = function () {
        if (!this.size.width || !this.size.height) {
            return;
        }

        let updateX = false;
        let updateY = false;
        if (this.size.width < Common.width()) {
            updateX = true;
            this.view.x = (this.size.width - Common.width()) / 2;
        }
        if (this.size.height < Common.height()) {
            updateY = true;
            this.view.y = (this.size.height - Common.height()) / 2;
        }

        if ((updateX && updateY) || !this.view.center) {
            return;
        }

        if (!updateX) {
            this.view.x = this.view.center.x - Common.width() / 2;
            if (this.view.x < 0) {
                this.view.x = 0;
            }
            if (this.view.x > this.size.width - Common.width()) {
                this.view.x = this.size.width - Common.width()
            }
        }

        if (!updateY) {
            this.view.y = this.view.center.y - Common.height() / 2;
            if (this.view.y < 0) {
                this.view.y = 0;
            }
            if (this.view.y > this.size.height - Common.height()) {
                this.view.y = this.size.height - Common.height()
            }
        }
    };

    this.update = function () {
        this.items.forEach(function (item) {
            item.update();
        });
    };

    this.createItem = function (options) {
        const item = new Item(options);
        item.stage = this;
        this.items.set(item.id, item);
        return item;
    };

    this.sortItems = function () {
        //支援ES5的兼容写法
        const array = [];
        this.items.forEach(function (item) {
            array[array.length] = item;
        });

        array.sort(function (item1, item2) {
            if (item1.z !== item2.z) {
                return item1.z - item2.z;
            }

            if (item1.y !== item2.y) {
                return item1.y - item2.y;
            }

            return item1.x - item2.x;
        });

        this.items = new Map();
        const map = this.items;
        array.forEach(function (item) {
            map.set(item.id, item);
        })
    };

    this.removeItem = function (id) {
        if (this.items.has(id)) {
            this.items.delete(id);
        }
    };
    this.updateItemId = function (item, newId, showId) {
        //删除旧id
        if (item.id && this.items.has(item.id)) {
            this.items.delete(item.id);
        }

        //增加新id,默认新id要显示出来
        if (showId === undefined) {
            showId = true;
        }
        item.id = newId;
        item.showId = showId;
        this.items.set(newId, item);
    };

    this.createTank = function (options) {
        const item = this.createItem(options);
        item.update = function () {
            generalUpdateEvent(item);
        };

        //set center
        if (!this.view.center && Resource.getUsername()) {
            if (item.id === Resource.getUsername()) {
                this.view.center = item;
            }
        }

        return item;
    };
    this.createAmmo = function (options) {
        const item = this.createItem(options);
        item.action = 1;
        item.z = -2;
        item.image = Resource.getImage("ammo");
        item.update = function () {
            generalUpdateEvent(item);
        };
        return item;
    };
    this.itemBomb = function (data, bombScale) {
        if (bombScale === undefined) {
            bombScale = 1;
        }

        if (!this.items.has(data.id)) {
            return;
        }

        generalUpdateAttribute(this, data);
        const item = this.items.get(data.id);
        item.action = 0;
        item.orientation = 0;
        item.scale = bombScale;
        item.z = 10;
        item.image = Resource.getImage("bomb");
        item.play = new Play(
            6,
            3,
            function () {
                item.orientation = 6 - this.frames;
            }, function () {
                thisStage.removeItem(item.id);
            });

        //删除重加，确保在最上层绘制
        this.items.delete(item.id);
        this.items.set(item.id, item);

        //remove center
        if (item === this.view.center) {
            this.view.center = null;
        }
    };

    const generalUpdateEvent = function (item) {
        if (item.play) {
            item.play.update();
        }

        if (item.action === 0) {
            return;
        }

        switch (item.orientation) {
            case 0:
                item.y -= item.speed;
                break;
            case 1:
                item.y += item.speed;
                break;
            case 2:
                item.x -= item.speed;
                break;
            case 3:
                item.x += item.speed;
                break;
        }
    };

    const generalUpdateAttribute = function (thisStage, newAttr) {
        if (newAttr.x === undefined || newAttr.y === undefined) {
            return;
        }
        thisStage.items.get(newAttr.id).x = newAttr.x;
        thisStage.items.get(newAttr.id).y = newAttr.y;
        thisStage.items.get(newAttr.id).orientation = newAttr.orientation;
        thisStage.items.get(newAttr.id).speed = newAttr.speed;
        thisStage.items.get(newAttr.id).action = newAttr.action;
    };

    const createOrUpdateTanks = function (thisStage, tanks) {
        /**
         * @param tank {{typeId}}
         */
        tanks.forEach(function (tank) {
            if (thisStage.items.has(tank.id)) {
                //已存在
                generalUpdateAttribute(thisStage, tank);
            } else {
                let tankImage;
                if (tank.typeId === "tankMenu") {
                    tankImage = Common.getRandomTankImage();
                } else {
                    tankImage = Resource.getImage(tank.typeId);
                }
                const tankItem = thisStage.createTank({
                    id: tank.id,
                    x: tank.x,
                    y: tank.y,
                    orientation: tank.orientation,
                    action: tank.action,
                    showId: true,
                    speed: tank.speed,
                    image: tankImage,
                    teamId: tank.teamId,
                    scale: 0.1
                });
                tankItem.play = new Play(30, 1,
                    function () {
                        tankItem.scale += this.animationScale;
                    },
                    function () {
                        tankItem.scale = 1;
                    });
                tankItem.play.animationScale = 0.03;
            }
        });
    };
    const createOrUpdateBullets = function (thisStage, ammoList) {
        let addNew = false;
        ammoList.forEach(function (ammo) {
            if (thisStage.items.has(ammo.id)) {
                //已存在
                generalUpdateAttribute(thisStage, ammo);
            } else {
                addNew = true;
                thisStage.createAmmo({
                    id: ammo.id,
                    x: ammo.x,
                    y: ammo.y,
                    orientation: ammo.orientation,
                    speed: ammo.speed
                });
            }
        });
        if (addNew) {
            thisStage.sortItems();
        }
    }
}