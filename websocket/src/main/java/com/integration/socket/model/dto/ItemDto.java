package com.integration.socket.model.dto;

import com.integration.socket.model.bo.TankBo;
import lombok.Data;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/1
 */

@Data
public class ItemDto {
    private String id;
    private Double x;
    private Double y;
    private String typeId;
    private Integer orientation;
    private Integer action;
    private Double speed;

    public static ItemDto convert(TankBo tankBo) {
        ItemDto tankDto = new ItemDto();
        tankDto.setId(tankBo.getTankId());
        tankDto.setX(tankBo.getX());
        tankDto.setY(tankBo.getY());
        tankDto.setTypeId(tankBo.getType().getTypeId());
        tankDto.setOrientation(tankBo.getOrientationType().getValue());
        tankDto.setAction(tankBo.getActionType().getValue());
        tankDto.setSpeed(tankBo.getType().getSpeed());
        return tankDto;
    }
}
