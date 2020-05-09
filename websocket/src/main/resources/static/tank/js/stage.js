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
                const tanks = messageDto.message;
                /**
                 * @param tank {{typeId}}
                 */
                tanks.forEach(function (tank) {
                    if (thisStage.items.has(tank.id)) {
                        //已存在
                        thisStage.items.get(tank.id).x = tank.x;
                        thisStage.items.get(tank.id).y = tank.y;
                        thisStage.items.get(tank.id).orientation = tank.orientation;
                        thisStage.items.get(tank.id).action = tank.action;
                        thisStage.items.get(tank.id).speed = tank.speed;
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
                break;
            case "REMOVE_TANK":
                this.removeItem(messageDto.message);
                break;
        }
    };

    this.draw = function (context) {
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
        if (!options.image) {
            options.image = Resource.getImage("tank01");
        }

        options.update = function () {
            this.updateAnimation();

            if (this.action === 0) {
                return;
            }

            switch (this.orientation) {
                case 0:
                    this.y -= this.speed;
                    break;
                case 1:
                    this.y += this.speed;
                    break;
                case 2:
                    this.x -= this.speed;
                    break;
                case 3:
                    this.x += this.speed;
                    break;
            }
        };
        return this.createItem(options);
    };
}