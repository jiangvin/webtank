package com.integration.socket.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.integration.socket.model.bo.BulletBo;
import com.integration.socket.model.bo.TankBo;
import lombok.Data;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/1
 */

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
public class ItemDto {
    private String id;
    private Double x;
    private Double y;
    private String typeId;
    private Integer orientation;
    private Integer action;
    private Double speed;
    private Integer teamId;

    public static ItemDto convert(TankBo tankBo) {
        ItemDto tankDto = new ItemDto();
        tankDto.setId(tankBo.getTankId());
        tankDto.setX(tankBo.getX());
        tankDto.setY(tankBo.getY());
        tankDto.setTypeId(tankBo.getType().getTypeId());
        tankDto.setOrientation(tankBo.getOrientationType().getValue());
        tankDto.setAction(tankBo.getActionType().getValue());
        tankDto.setSpeed(tankBo.getType().getSpeed());
        if (tankBo.getTeamType() != null) {
            tankDto.setTeamId(tankBo.getTeamType().getValue());
        }
        return tankDto;
    }

    public static ItemDto convert(BulletBo bulletBo) {
        ItemDto ammoDto = new ItemDto();
        ammoDto.setId(bulletBo.getId());
        ammoDto.setX(bulletBo.getX());
        ammoDto.setY(bulletBo.getY());
        ammoDto.setOrientation(bulletBo.getOrientationType().getValue());
        ammoDto.setSpeed(bulletBo.getSpeed());
        return ammoDto;
    }
}
