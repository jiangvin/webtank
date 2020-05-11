function Stage(params) {

    const thisStage = this;

    this.params = params || {};
    this.settings = {
        showTeam: false,                 //显示团队标志
        id: null,                        //布景id
        items: new Map(),				 //对象队列
        view: {x: 0, y: 0},              //视野
        size: {width: 0, height: 0},     //场景大小
        backgroundImage: null,           //背景图

        //处理控制事件
        controlEvent: function () {
        },

        //拓展函数
        receiveStompMessageExtension: function () {
        }
    };
    Common.extend(this, this.settings, this.params);

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
                this.sortItems();
                break;
            case "REMOVE_TANK":
                this.itemBomb(messageDto.message);
                break;
            case "AMMO":
                createOrUpdateAmmoList(thisStage, messageDto.message);
                this.sortItems();
                break;
            case "REMOVE_AMMO":
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

        context.fillStyle = context.createPattern(this.backgroundImage, "repeat");
        const start = this.convertToScreenPoint({x: 0, y: 0});
        const end = this.convertToScreenPoint({x: this.size.width, y: this.size.height});
        context.fillRect(start.x, start.y, end.x, end.y);
    };

    //真实坐标转换屏幕坐标
    this.convertToScreenPoint = function (point) {
        const screenPoint = {};
        screenPoint.x = point.x - this.view.x;
        screenPoint.y = point.y - this.view.y;
        return screenPoint;
    };

    this.draw = function (context) {
        this.drawBackground(context);
        this.items.forEach(function (item) {
            item.draw(context);
        });
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
                thisStage.createTank({
                    id: tank.id,
                    x: tank.x,
                    y: tank.y,
                    orientation: tank.orientation,
                    action: tank.action,
                    showId: true,
                    speed: tank.speed,
                    image: tankImage,
                    teamId: tank.teamId
                });
            }
        });
    };
    const createOrUpdateAmmoList = function (thisStage, ammoList) {
        ammoList.forEach(function (ammo) {
            if (thisStage.items.has(ammo.id)) {
                //已存在
                generalUpdateAttribute(thisStage, ammo);
            } else {
                thisStage.createAmmo({
                    id: ammo.id,
                    x: ammo.x,
                    y: ammo.y,
                    orientation: ammo.orientation,
                    speed: ammo.speed
                });
            }
        });
    }
}