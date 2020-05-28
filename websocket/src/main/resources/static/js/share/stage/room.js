/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/27
 */
import stage from "./stage.js";
import Resource from "../tool/resource.js";
import Common from "../tool/common.js";
import Play from "./play.js";

export default class room extends stage {
    constructor() {
        super();

        this.roomInfo = {};
        this.roomInfo.mapId = 1;
        this.roomInfo.roomType = "PVE";
        this.size = {};
        this.view = {x: 0, y: 0};

        this.backgroundImage = Resource.getImage("background","jpg");

        this.mask = true;
        this.maskImage = Resource.getImage("background_loading");
        this.maskInfo = null;
    }

    initSinglePlayer() {
        this.roomInfo.roomId = Resource.getUser().username + "的房间";

        let displayNum;
        if (this.roomInfo.mapId < 10) {
            displayNum = "0" + this.roomInfo.mapId;
        } else {
            displayNum = "" + this.roomInfo.mapId;
        }
        this.maskInfo = "MISSION " + displayNum;

        const thisRoom = this;
        Common.getRequest("/user/getMapFromId?roomType=PVE&id=" + this.roomInfo.mapId, function (data) {
            thisRoom.loadMap(data);
            thisRoom.mask = false;
        })
    }

    draw(ctx) {
        //每秒排序一次
        if (Resource.getRoot().frontFrame.totalFrames % 60 === 0) {
            this.sortItems();
        }

        this.drawBackground(ctx);
        super.draw(ctx);
        this.drawMask(ctx);
        this.drawRoomInfo(ctx);
    }

    drawBackground(ctx) {
        if (!this.size.width || !this.size.height || !this.backgroundImage) {
            return;
        }

        if (!this.backgroundImage.repeatX || !this.backgroundImage.repeatY) {
            this.calculateBackgroundRepeat();
        }

        const mapStart = this.convertToScreenPoint({x: 0, y: 0});
        for (let x = 0; x < this.backgroundImage.repeatX; ++x) {
            for (let y = 0; y < this.backgroundImage.repeatY; ++y) {
                const start = {};
                const end = {};
                start.x = x * this.backgroundImage.sizeX;
                start.y = y * this.backgroundImage.sizeY;

                end.x = start.x + this.backgroundImage.sizeX;
                end.y = start.y + this.backgroundImage.sizeY;

                ctx.drawImage(this.backgroundImage,
                    0, 0,
                    this.backgroundImage.width, this.backgroundImage.height,
                    start.x + mapStart.x, start.y + mapStart.y,
                    this.backgroundImage.sizeX, this.backgroundImage.sizeY);
            }
        }
    }

    drawRoomInfo(ctx) {
        //标题
        const tipMessage = '房间号:' + this.roomInfo.roomId +
            " 关卡:" + this.roomInfo.mapId + " [" + this.roomInfo.roomType + "]";
        this.drawTips(ctx, tipMessage, 10, 6);

        //相关信息
        if (this.roomInfo.roomType === 'PVE' && this.roomInfo.playerLife !== undefined) {
            this.drawTips(ctx,
                "玩家剩余生命:" + this.roomInfo.playerLife,
                10, 24);
            this.drawTips(ctx,
                "电脑剩余生命:" + this.roomInfo.computerLife,
                10, 40);
        } else if (this.roomInfo.playerLife !== undefined) {
            this.drawTips(ctx,
                "红队剩余生命:" + this.roomInfo.playerLife,
                10, 24);
            this.drawTips(ctx, "蓝队剩余生命:" + this.roomInfo.computerLife,
                10, 40);
        }
    }

    drawMask(ctx) {
        if (!this.mask) {
            return;
        }

        ctx.drawImage(this.maskImage,
            0, 0,
            this.maskImage.width, this.maskImage.height,
            0, 0,
            Resource.width(), Resource.height());

        Common.drawTitle(ctx, this.maskInfo);
    }

    drawTips(ctx, tips, x, y) {
        ctx.font = '14px Helvetica';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(tips, x, y);
    }

    loadMap(data) {
        if (data.mapId !== undefined) {
            this.roomInfo.mapId = data.mapId;
        }
        if (data.playerLife !== undefined) {
            this.roomInfo.playerLife = data.playerLife;
        }
        if (data.computerLife !== undefined) {
            this.roomInfo.computerLife = data.computerLife;
        }
        if (data.width && data.height) {
            this.size.width = data.width;
            this.size.height = data.height;
            this.calculateBackgroundRepeat();
        }

        // load mapItem
        const thisRoom = this;
        if (data.itemList) {
            data.itemList.forEach(function (itemData) {
                thisRoom.createOrUpdateMapItem(itemData);
            })
        }

        this.sortItems();
    }

    createOrUpdateMapItem(data) {
        let item;
        if (this.items.has(data.id)) {
            item = this.items.get(data.id);
        } else {
            item = this.createItem({id: data.id})
        }

        const typeId = parseInt(data.typeId);
        this.setResourceImage(item, typeId);
        if (!item.image) {
            return;
        }

        this.setBarrier(item, typeId);
        const position = this.getPositionFromId(data.id);
        item.x = position.x;
        item.y = position.y;

        //调整z值
        if (typeId === 5) {
            item.z = 2;
        } else if (typeId === 4) {
            item.z = -4;
        }

        //播放动画
        switch (typeId) {
            case 4:
            case 6:
            case 7:
                item.play = new Play(1, 30,
                    function () {
                        item.orientation = (item.orientation + 1) % 2;
                    }, function () {
                        this.frames = 1;
                    });
                break;
        }
    }

    setResourceImage(item, typeId) {
        switch (typeId) {
            case 0:
                item.image = Resource.getImage("brick");
                break;
            case 1:
                item.image = Resource.getImage("brick");
                item.orientation = 1;
                break;
            case 2:
                item.image = Resource.getImage("iron");
                break;
            case 3:
                item.image = Resource.getImage("iron");
                item.orientation = 1;
                break;
            case 4:
                item.image = Resource.getImage("river");
                break;
            case 5:
                item.image = Resource.getImage("grass");
                break;
            case 6:
                item.image = Resource.getImage("red_king");
                break;
            case 7:
                item.image = Resource.getImage("blue_king");
                break;
        }
    };

    setBarrier(item, typeId) {
        if (typeId !== 5) {
            item.isBarrier = true;
        }
    }

    getPositionFromId(id) {
        const position = {};
        const infos = id.split("_");
        const size = Resource.getUnitSize();
        position.x = parseInt(infos[0]) * size + size / 2;
        position.y = parseInt(infos[1]) * size + size / 2;
        return position;
    };

    sortItems() {
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


    calculateBackgroundRepeat() {
        const imageRate = this.backgroundImage.width / this.backgroundImage.height;
        const mapRate = this.size.width / this.size.height;
        if (mapRate >= imageRate * 0.7 && mapRate <= imageRate * 1.3) {
            this.backgroundImage.repeatX = 1;
            this.backgroundImage.repeatY = 1;
        } else {
            if (mapRate < imageRate * 0.7) {
                this.backgroundImage.repeatX = 1;
                this.backgroundImage.repeatY = Math.round(this.size.height / (this.size.width / imageRate));
            } else {
                this.backgroundImage.repeatY = 1;
                this.backgroundImage.repeatX = Math.round(this.size.width / (this.size.height * imageRate));
            }
        }
        this.backgroundImage.sizeX = this.size.width / this.backgroundImage.repeatX;
        this.backgroundImage.sizeY = this.size.height / this.backgroundImage.repeatY;
    };

    /**
     * 真实坐标转换屏幕坐标
     * @param point
     */
    convertToScreenPoint(point) {
        const screenPoint = {};
        screenPoint.x = point.x - this.view.x;
        screenPoint.y = point.y - this.view.y;
        return screenPoint;
    };
}