package com.integration.socket.model.dto;

import com.integration.socket.model.Constant;
import com.integration.socket.repository.jooq.tables.records.UserRecord;
import com.integration.util.time.TimeUtil;
import lombok.Data;
import org.springframework.beans.BeanUtils;

import java.sql.Timestamp;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/29
 */

@Data
public class UserDto {
    private String userId;
    private String username;
    private String userDevice;
    private int coin;
    private int stage;
    private int star;
    private int hardStage;
    private String tankType;
    private Timestamp tankTypeExpired;
    private Timestamp redStarExpired;
    private Timestamp ghostExpired;
    private Timestamp clockExpired;

    public static UserDto convert(UserRecord userRecord) {
        UserDto userDto = new UserDto();
        BeanUtils.copyProperties(userRecord, userDto);

        if (userDto.getTankTypeExpired() == null || userDto.getTankTypeExpired().before(TimeUtil.now())) {
            userDto.setTankType(Constant.DEFAULT_TANK_TYPE);
            userDto.setTankTypeExpired(null);
        }

        //去掉userId和userDevice
        userDto.setUserId(null);
        userDto.setUserDevice(null);
        return userDto;
    }
}
