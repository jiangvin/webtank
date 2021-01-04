import Stage from "./stage.js";
import Common from "../tool/common.js";
import RoomInfo from "../item/roominfo.js";
import TeamSelector from "../item/teamselector.js";

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/7
 */

export default class NetCreate extends Stage {
    constructor() {
        super();

        this.createFullScreenItem("net_create");

        //返回
        this.createControl({
            leftTop: {
                x: 1784,
                y: 32
            },
            size: {
                w: 86,
                h: 96
            },
            callback: function () {
                Common.lastStage();
            }
        });

        //闯关模式
        this.createControl({
            leftTop: {
                x: 320,
                y: 280
            },
            size: {
                w: 540,
                h: 635
            },
            callback: function () {
                Common.gotoStage("mission", new RoomInfo(true));
            }
        });

        //对战模式
        this.createControl({
            leftTop: {
                x: 1055,
                y: 280
            },
            size: {
                w: 540,
                h: 635
            },
            callback: () => {
                new TeamSelector(this, (teamType) => {
                    const roomInfo = new RoomInfo(true);
                    roomInfo.roomType = "PVP";
                    roomInfo.joinTeamType = teamType;
                    Common.gotoStage("room", roomInfo);
                });
            }
        });
    }
}