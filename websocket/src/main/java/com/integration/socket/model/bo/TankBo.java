package com.integration.socket.model.bo;

import com.integration.socket.model.ActionType;
import com.integration.socket.model.OrientationType;
import com.integration.socket.model.TeamType;
import com.integration.socket.model.dto.ItemDto;
import com.integration.socket.util.CommonUtil;
import lombok.Data;

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

    /**
     * 控制缓存
     */
    private OrientationType controlOrientation = OrientationType.UP;
    private ActionType controlAction = ActionType.STOP;

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

    public AmmoBo fire() {
        if (ammoCount <= 0) {
            return null;
        }

        if (reloadTime != 0) {
            return null;
        }

        //重置重新填装
        --ammoCount;
        reloadTime = type.getAmmoReloadTime();

        return new AmmoBo(
                   CommonUtil.getId(),
                   this.tankId,
                   this.teamType,
                   type.getAmmoMaxLifeTime(),
                   this.x,
                   this.y,
                   this.getType().getAmmoSpeed(),
                   this.orientationType);
    }

    public void addAmmoCount() {
        ++ammoCount;
    }
}
