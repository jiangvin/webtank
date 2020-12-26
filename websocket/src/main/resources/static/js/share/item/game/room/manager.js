import Resource from "../../../tool/resource.js";
import Status from "../../../tool/status.js";
import Sound from "../../../tool/sound.js";
import NewConfirm from "../../newconfirm.js";

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/21
 */

export default class Manager {
    constructor(room) {
        this.room = room;
    }

    createControlEvent() {
        const thisRoom = this.room;
        //返回按钮
        thisRoom.createControl({
            leftTop: {
                x: -130,
                y: 30
            },
            size: {
                w: 100,
                h: 100
            },
            needOffset: false,
            hasSound: false,
            callBack: function () {
                //返回主菜单(暂停状态不能返回)
                if (!Status.isGaming()) {
                    return;
                }

                Sound.click();
                new NewConfirm(
                    thisRoom,
                    [
                        "返回主菜单将不会获得任何积分和金币",
                        "确定要返回吗？"
                    ],
                    function () {
                        Resource.getRoot().gotoStage("menu");
                    });
            }
        })
    }

    drawRoomInfo(ctx) {
        const rect = Resource.getImage("room_rect");
        const interval = 320;

        const roomInfo = this.room.roomInfo;

        const icons = [
            Resource.getImage("room_stage"),
            Resource.getImage("player_life"),
            Resource.getImage("enemy_life"),
            Resource.getImage("gold"),
            Resource.getImage("room")
        ];
        const infos = [
            roomInfo.mapId + "-" + roomInfo.subId,
            "x" + roomInfo.playerLife,
            "x" + roomInfo.computerLife,
            Resource.getUser().coin,
            roomInfo.roomId
        ];

        ctx.font = '36px gameFont';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF';

        for (let i = 0; i < 5; ++i) {
            ctx.drawImage(
                rect,
                0, 0,
                rect.width, rect.height,
                100 + i * interval, 50,
                rect.width * 1.7, rect.height * 1.5
            );

            const icon = icons[i];
            ctx.drawImage(
                icon,
                0, 0,
                icon.width, icon.height,
                100 + i * interval, 30,
                100, 100
            );

            ctx.fillText(infos[i], 272 + i * interval, 82);
        }

        this.drawBackButton(ctx);
    }

    drawBackButton(ctx) {
        if (!Status.isGaming()) {
            return;
        }

        const back = Resource.getImage("back");
        ctx.drawImage(
            back,
            0, 0,
            back.width, back.height,
            Resource.width() - 130, 30,
            100, 100
        );
    }
}