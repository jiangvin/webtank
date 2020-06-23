package com.integration.socket.model.dto;

import com.integration.socket.repository.jooq.tables.records.UserRecord;
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

    private Timestamp redStarExpired;
    private Timestamp ghostExpired;
    private Timestamp clockExpired;

    public static UserDto convert(UserRecord userRecord) {
        UserDto userDto = new UserDto();
        BeanUtils.copyProperties(userRecord, userDto);

        //去掉userId和userDevice
        userDto.setUserId(null);
        userDto.setUserDevice(null);
        return userDto;
    }
}
