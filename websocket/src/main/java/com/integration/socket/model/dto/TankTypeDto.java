package com.integration.socket.model.dto;

import com.integration.socket.model.bo.TankTypeBo;
import lombok.Data;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/8
 */

@Data
public class TankTypeDto {
    private String typeId;
    private double speed;
    private double ammoSpeed;

    public static TankTypeDto convert(TankTypeBo tankTypeBo) {
        TankTypeDto tankTypeDto = new TankTypeDto();
        tankTypeDto.setTypeId(tankTypeBo.getTypeId());
        tankTypeDto.setSpeed(tankTypeBo.getSpeed());
        tankTypeDto.setAmmoSpeed(tankTypeBo.getAmmoSpeed());
        return tankTypeDto;
    }
}
