function Stage(params) {

    const thisStage = this;

    this.params = params || {};
    this.settings = {
        showTeam: false,                       //显示团队标志
        id: null,                              //布景id
        items: new Map(),				       //对象队列
        view: {x: 0, y: 0, center: null},      //视野
        size: {width: 0, height: 0},           //场景大小
        backgroundImage: null,                 //背景图
        updateSelf: true,                      //服务器远端同步自己

        //拓展函数
        receiveStompMessageExtension: function () {
        }
    };
    Common.extend(this, this.settings, this.params);

    //处理控制事件
    this.controlEvent = function (event) {
        this.controlTank(event);
        this.controlView(event);
    };

    this.controlTank = function (event) {
        switch (event) {
            case "Up":
                this.setControl(0, 1);
                break;
            case "Down":
                this.setControl(1, 1);
                break;
            case "Left":
                this.setControl(2, 1);
                break;
            case "Right":
                this.setControl(3, 1);
                break;
            case "Stop":
                this.setControl(null, 0);
        }
    };

    /**
     * 该方法在room中被重载
     * @param orientation
     * @param action
     */
    this.setControl = function (orientation, action) {
        if (this.view.center === null) {
            return;
        }
        const center = this.view.center;

        if (orientation === null) {
            orientation = center.orientation;
        }
        if (center.orientation === orientation && center.action === action) {
            return;
        }

        Common.sendStompMessage({
            orientation: orientation,
            action: action
        }, "UPDATE_TANK_CONTROL");
    };

    /**
     * @param messageDto {{note,roomId,message,messageType}}
     */
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
                //除了坦克之间的碰撞以外其他情况不更新自己，否则会和客户端的自动避让起冲突
                let updateSelf = this.updateSelf;
                if (!updateSelf && messageDto.note === "COLLIDE_TANK") {
                    updateSelf = true;
                }
                createOrUpdateTanks(thisStage, messageDto.message, updateSelf);
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
                break;
        }
        this.receiveStompMessageExtension(messageDto);
    };

    this.drawBackground = function (context) {
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

    };

    this.update = function () {
        this.updateCenter();
        this.items.forEach(function (item) {
            item.update();
        });
    };

    /**
     * 该方法在room中被重载
     */
    this.updateCenter = function () {

    };

    this.createItem = function (options) {
        const item = new Item(options);
        item.stage = this;
        this.items.set(item.id, item);
        return item;
    };

    this.sortItems = function () {
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

    /**
     * 在room中重载
     * @param item
     */
    this.createTankExtension = function (item) {

    };

    this.createBullet = function (options) {
        const item = this.createItem(options);
        item.action = 1;
        item.image = Resource.getImage("bullet");
        item.update = function () {
            generalUpdateEvent(item);
        };
        return item;
    };

    const updateTankProperty = function (stage, tankData) {
        const tankItem = stage.items.get(tankData.id);
        tankItem.speed = tankData.speed;
        tankItem.hasShield = tankData.hasShield;
        if (tankData.typeId !== "tankMenu") {
            tankItem.image = Resource.getImage(tankData.typeId);
        }
    };

    const updateTankControl = function (stage, tankData) {
        const tankItem = stage.items.get(tankData.id);
        tankItem.x = tankData.x;
        tankItem.y = tankData.y;
        tankItem.orientation = tankData.orientation;
        tankItem.action = tankData.action;
    };
}