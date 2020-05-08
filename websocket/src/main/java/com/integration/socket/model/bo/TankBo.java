package com.integration.socket.model.bo;

import com.integration.socket.model.ActionType;
import com.integration.socket.model.OrientationType;
import com.integration.socket.model.dto.TankDto;
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
    private double x;
    private double y;
    private TankTypeBo type;

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

    public double getSpeed() {
        if (type != null) {
            return type.getSpeed();
        }
        return 1.0;
    }
}
