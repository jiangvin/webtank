import Resource from "../../../tool/resource.js";
import Status from "../../../tool/status.js";
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
            hasSound: false,
            check: function () {
                return Status.isGaming() || Status.getValue() === Status.statusPauseForNet();
            },
            callback: function () {
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
        const interval = 320;

        const roomInfo = this.room.roomInfo;

        const icons = [
            "room_stage",
            "player_life",
            "enemy_life",
            "gold",
            "room"
        ];
        const infos = [
            roomInfo.mapId + "-" + roomInfo.subId,
            "x" + roomInfo.playerLife,
            "x" + roomInfo.computerLife,
            Resource.getUser().coin,
            roomInfo.roomId
        ];

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF';

        for (let i = 0; i < 5; ++i) {
            ctx.displayTopLeft(
                "room_rect",
                100 + i * interval, 50,
                277);

            const icon = icons[i];
            ctx.displayTopLeft(
                icon,
                100 + i * interval, 30,
                100, 100);

            ctx.displayGameText(infos[i], 272 + i * interval, 82, 36);
        }

        this.drawBackButton(ctx);
    }

    drawBackButton(ctx) {
        if (!Status.isGaming() && Status.getValue() !== Status.statusPauseForNet()) {
            return;
        }
        ctx.displayTopLeft(
            "back",
            Resource.formatWidth() - 130, 30,
            100, 100
        );
    }
}