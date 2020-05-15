package com.integration.socket.model.bo;

import com.integration.socket.model.ActionType;
import com.integration.socket.model.OrientationType;
import com.integration.dto.room.TeamType;
import com.integration.socket.model.dto.ItemDto;
import com.integration.socket.util.CommonUtil;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/1
 */

@Data
public class TankBo {
    private String tankId;
    private String userId;
    private OrientationType orientationType = OrientationType.UP;
    private ActionType actionType = ActionType.STOP;
    private TeamType teamType;
    private double x;
    private double y;
    private TankTypeBo type;
    private int reloadTime;
    private int ammoCount;
    private long lastSyncTime = System.currentTimeMillis();
    private List<String> gridKeyList = new ArrayList<>();

    public void refreshSyncTime() {
        this.lastSyncTime = System.currentTimeMillis();
    }

    public static TankBo convert(ItemDto tankDto) {
        TankBo tankBo = new TankBo();
        tankBo.setTankId(tankDto.getId());
        tankBo.setUserId(tankDto.getId());
        tankBo.setOrientationType(OrientationType.convert(tankDto.getOrientation()));
        tankBo.setActionType(ActionType.convert(tankDto.getAction()));
        tankBo.setX(tankDto.getX());
        tankBo.setY(tankDto.getY());
        tankBo.setType(TankTypeBo.getTankType(tankDto.getTypeId()));
        tankBo.setAmmoCount(tankBo.getType().getAmmoMaxCount());
        return tankBo;
    }

    public BulletBo fire() {
        if (ammoCount <= 0) {
            return null;
        }

        if (reloadTime != 0) {
            return null;
        }

        //重置重新填装
        --ammoCount;
        reloadTime = type.getAmmoReloadTime();

        return new BulletBo(
                   CommonUtil.getId(),
                   this.tankId,
                   this.teamType,
                   type.getAmmoMaxLifeTime(),
                   this.x,
                   this.y,
                   this.getType().getAmmoSpeed(),
                   this.getType().isBrokenIron(),
                   this.orientationType,
                   null,
                   null,
                   System.currentTimeMillis());
    }

    public void run(double speed) {
        switch (getOrientationType()) {
            case UP:
                this.y -= speed;
                break;
            case DOWN:
                this.y += speed;
                break;
            case LEFT:
                this.x -= speed;
                break;
            case RIGHT:
                this.x += speed;
                break;
            default:
                break;
        }
    }

    public void addAmmoCount() {
        ++ammoCount;
    }

    public List<String> generateGridKeyList() {
        List<String> keys = new ArrayList<>();
        int size = CommonUtil.UNIT_SIZE;
        //缩小一个像素点检测，减少误差
        int half = size / 2 - 1;
        CommonUtil.addWithoutRepeat(CommonUtil.generateGridKey(x - half, y - half), keys);
        CommonUtil.addWithoutRepeat(CommonUtil.generateGridKey(x + half, y - half), keys);
        CommonUtil.addWithoutRepeat(CommonUtil.generateGridKey(x - half, y + half), keys);
        CommonUtil.addWithoutRepeat(CommonUtil.generateGridKey(x + half, y + half), keys);
        return keys;
    }
}
