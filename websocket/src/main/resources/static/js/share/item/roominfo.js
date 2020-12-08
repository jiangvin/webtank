/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/11/25
 */

export default class RoomInfo {
    constructor(isNet) {
        this.hardMode = false;
        this.mapId = 1;
        this.subId = 1;
        this.roomType = "PVE";
        this.joinTeamType = "RED";
        if (isNet) {
            this.roomId = "000";
            this.isNet = true;
        } else {
            this.roomId = "单人模式";
            this.isNet = false;
        }
    }
}