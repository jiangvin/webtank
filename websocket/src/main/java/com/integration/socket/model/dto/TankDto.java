package com.integration.socket.model.dto;

import com.integration.socket.model.bo.TankBo;
import lombok.Data;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/1
 */

@Data
public class TankDto {
    private String id;
    private Double x;
    private Double y;
    private Double speed;

    /**
     * 客户端最少传输资料，朝向和状态（在玩家控制时传输）
     */
    private int orientation;
    private int action;

    public static TankDto convert(TankBo tankBo) {
        TankDto tankDto = new TankDto();
        tankDto.setId(tankBo.getTankId());
        tankDto.setX(tankBo.getX());
        tankDto.setY(tankBo.getY());
        tankDto.setSpeed(tankBo.getSpeed());
        tankDto.setOrientation(tankBo.getOrientationType().getValue());
        tankDto.setAction(tankBo.getActionType().getValue());
        return tankDto;
    }
}
