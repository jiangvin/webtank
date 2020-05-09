package com.integration.socket.model.bo;

import com.integration.socket.model.ActionType;
import com.integration.socket.model.OrientationType;
import com.integration.socket.model.dto.TankDto;
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
    private double x;
    private double y;

    private TankTypeBo type;
    private List<AmmoBo> ammoList = new ArrayList<>();
    private int reloadTime;

    public static TankBo convert(TankDto tankDto) {
        TankBo tankBo = new TankBo();
        tankBo.setTankId(tankDto.getId());
        tankBo.setUserId(tankDto.getId());
        tankBo.setOrientationType(OrientationType.convert(tankDto.getOrientation()));
        tankBo.setActionType(ActionType.convert(tankDto.getAction()));
        tankBo.setX(tankDto.getX());
        tankBo.setY(tankDto.getY());
        tankBo.setType(TankTypeBo.getTankType(tankDto.getTypeId()));
        return tankBo;
    }

    public AmmoBo fire() {
        int maxCount = type.getAmmoCount();
        if (ammoList.size() >= maxCount) {
            return null;
        }

        if (reloadTime != 0) {
            return null;
        }

        //fire
        reloadTime = type.getAmmoReloadTime();
        AmmoBo newAmmo = new AmmoBo(
            CommonUtil.getId(),
            type.getAmmoLifeTime(),
            this.x,
            this.y,
            this.orientationType);
        this.ammoList.add(newAmmo);
        return newAmmo;
    }
}
