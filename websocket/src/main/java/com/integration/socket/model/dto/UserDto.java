package com.integration.socket.model.dto;

import com.integration.socket.repository.jooq.tables.records.UserRecord;
import lombok.Data;

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

    public static UserDto convert(UserRecord userRecord) {
        UserDto userDto = new UserDto();
        userDto.setUsername(userRecord.getUsername());
        userDto.setCoin(userRecord.getCoin());
        userDto.setRedStarExpired(userRecord.getRedStarExpired());
        return userDto;
    }
}
