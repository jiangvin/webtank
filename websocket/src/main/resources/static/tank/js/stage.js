function Stage(params) {
    this.params = params || {};
    this.settings = {
        index: 0,                        //布景索引
        items: [],						//对象队列
        controlEvent: function () {
        }
    };
    Common.extend(this, this.settings, this.params);

    this.receiveStompMessage = function (messageDto) {
        const thisStage = this;
        switch (messageDto.messageType) {
            case "TANKS":
                const tanks = messageDto.message;
                tanks.forEach(function (tank) {
                    if (thisStage.items[tank.id]) {
                        //已存在
                        thisStage.items[tank.id].x = tank.x;
                        thisStage.items[tank.id].y = tank.y;
                        thisStage.items[tank.id].orientation = tank.orientation;
                        thisStage.items[tank.id].action = tank.action;
                        thisStage.items[tank.id].typeId = tank.typeId;
                        thisStage.items[tank.id].speed = tank.speed;
                    } else {
                        thisStage.createTank({
                            id: tank.id,
                            x: tank.x,
                            y: tank.y,
                            orientation: tank.orientation,
                            action: tank.action,
                            typeId: tank.typeId,
                            showId: true
                        });
                    }
                });
                break;
            case "REMOVE_TANK":
                const tankId = messageDto.message;
                if (thisStage.items[tankId]) {
                    delete thisStage.items[tankId];
                }
                break;
        }
    };

    this.draw = function (context) {
        for (let k in this.items) {
            this.items[k].draw(context);
        }
    };

    this.update = function () {
        for (let k in this.items) {
            this.items[k].update();
        }
    };

    this.createItem = function (options) {
        const item = new Item(options);
        this.items[item.id] = item;
        return item;
    };
    this.updateItemId = function (item, newId, showId) {
        //删除旧id
        if (item.id && this.items[item.id]) {
            delete this.items[item.id];
        }

        //增加新id,默认新id要显示出来
        if (showId === undefined) {
            showId = true;
        }
        item.id = newId;
        item.showId = showId;
        this.items[newId] = item;
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