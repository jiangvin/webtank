import Resource from "../../../tool/resource.js";
import Status from "../../../tool/status.js";
import NewConfirm from "../../newconfirm.js";
import Common from "../../../tool/common.js";

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

    generateInfoUnits() {
        const roomInfo = this.room.roomInfo;
        return [
            {
                icon: "room_stage",
                info: roomInfo.mapId + "-" + roomInfo.subId
            },
            {
                icon: "player_life",
                info: "x" + roomInfo.playerLife
            },
            {
                icon: "enemy_life",
                info: "x" + roomInfo.computerLife
            }
        ];
    }

    drawRoomInfo(ctx) {
        const infoUnits = this.generateInfoUnits();
        const style = {
            rectW: 277,
            iconW: 100,
            interval: 43
        };
        style.startX = Common.generateStartX(infoUnits.length, style.rectW, style.interval);
        style.startY = 20;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF';
        for (let i = 0; i < infoUnits.length; ++i) {
            const x = style.startX + i * (style.rectW + style.interval);
            ctx.displayTopLeft(
                "room_rect",
                style.startX + i * (style.rectW + style.interval), style.startY,
                style.rectW);

            ctx.displayTopLeft(
                infoUnits[i].icon,
                style.startX + i * (style.rectW + style.interval), style.startY - 20,
                style.iconW, style.iconW);

            ctx.displayGameText(infoUnits[i].info,
                x + style.rectW * .6, style.startY + 32,
                36);
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