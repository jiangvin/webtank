/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/27
 */
import stage from "./stage.js";
import Resource from "../tool/resource.js";
import Common from "../tool/common.js";

export default class room extends stage {
    constructor() {
        super();

        this.roomInfo = {};
        this.roomInfo.mapId = 1;
        this.roomInfo.roomType = "PVE";
        this.size = {};

        this.mask = true;
        this.maskInfo = null;
    }

    init() {
        this.roomInfo.roomId = Resource.getUser().username + "的房间";

        //init maskInfo
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
        })
    }

    draw(ctx) {
        super.draw(ctx);
        this.drawMask(ctx);
        this.drawRoomInfo(ctx);
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

        const bgImage = Resource.getImage("background_loading");
        ctx.drawImage(bgImage,
            0, 0,
            bgImage.width, bgImage.height,
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
            // this.calculateBackgroundRepeat();
        }

        // load mapItem
        if (data.itemList) {
            data.itemList.forEach(function (itemData) {
                createOrUpdateMapItem(itemData);
            })
        }
    }

    createOrUpdateMapItem(itemData) {
        let item;
        if (this.items.has(data.id)) {
            item = this.items.get(data.id);
        } else {
            item = this.createItem({id: Resource.generateClientId()})
        }
    }

    //
    // calculateBackgroundRepeat() {
    //     const imageRate = this.backgroundImage.width / this.backgroundImage.height;
    //     const mapRate = this.size.width / this.size.height;
    //     if (mapRate >= imageRate * 0.7 && mapRate <= imageRate * 1.3) {
    //         this.backgroundImage.repeatX = 1;
    //         this.backgroundImage.repeatY = 1;
    //     } else {
    //         if (mapRate < imageRate * 0.7) {
    //             this.backgroundImage.repeatX = 1;
    //             this.backgroundImage.repeatY = Math.round(this.size.height / (this.size.width / imageRate));
    //         } else {
    //             this.backgroundImage.repeatY = 1;
    //             this.backgroundImage.repeatX = Math.round(this.size.width / (this.size.height * imageRate));
    //         }
    //     }
    //     this.backgroundImage.sizeX = this.size.width / this.backgroundImage.repeatX;
    //     this.backgroundImage.sizeY = this.size.height / this.backgroundImage.repeatY;
    // };
}