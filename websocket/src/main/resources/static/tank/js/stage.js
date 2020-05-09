function Stage(params) {
    this.params = params || {};
    this.settings = {
        index: 0,                        //布景索引
        items: new Map(),				 //对象队列

        //处理控制事件
        controlEvent: function () {
        }

    };
    Common.extend(this, this.settings, this.params);

    this.receiveStompMessage = function (messageDto) {
        const thisStage = this;
        switch (messageDto.messageType) {
            case "TANKS":
                createOrUpdateTanks(thisStage, messageDto.message);
                break;
            case "REMOVE_TANK":
                this.removeItem(messageDto.message);
                break;
            case "AMMO":
                createOrUpdateAmmoList(thisStage, messageDto.message);
                break;
            case "REMOVE_AMMO":
                this.removeAmmo(messageDto.message);
                break;

        }
    };

    this.draw = function (context) {
        const itemsWithZ = [];
        this.items.forEach(function (item) {
            if (item.z === 0) {
                item.draw(context);
            } else {
                if (!itemsWithZ[item.z]) {
                    itemsWithZ[item.z] = [];
                }
                const newIndex = itemsWithZ[item.z].length;
                itemsWithZ[item.z][newIndex] = item;
            }
        });

        //draw item with z
        itemsWithZ.forEach(function (items) {
            items.forEach(function (item) {
                item.draw(context);
            })
        })
    };

    this.update = function () {
        this.items.forEach(function (item) {
            item.update();
        });
    };

    this.createItem = function (options) {
        const item = new Item(options);
        this.items.set(item.id, item);
        return item;
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
        item.z = 2;
        item.update = function () {
            generalUpdateEvent(item);
        };
        return item;
    };
    this.createAmmo = function (options) {
        const item = this.createItem(options);
        item.action = 1;
        item.z = 1;
        item.image = Resource.getImage("ammo");
        item.update = function () {
            generalUpdateEvent(item);
        };
        return item;
    };
    this.removeAmmo = function (ammoData) {
        if (!this.items.has(ammoData.id)) {
            return;
        }
        generalUpdateAttribute(this, ammoData);
        const ammoItem = this.items.get(ammoData.id);
        itemBomb(this, ammoItem, 0.5);
    };

    const itemBomb = function (thisStage, item, bombScale) {
        if (bombScale === undefined) {
            bombScale = 1;
        }

        item.action = 0;
        item.orientation = 0;
        item.scale = bombScale;
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
                    image: tankImage
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