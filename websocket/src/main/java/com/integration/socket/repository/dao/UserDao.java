package com.integration.socket.repository.dao;

import com.integration.socket.model.dto.UserDto;
import com.integration.socket.repository.jooq.tables.records.UserRecord;
import org.springframework.beans.BeanUtils;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/13
 */

@Repository
public class UserDao extends BaseDao {
    public UserRecord query(String userId) {
        return create.selectFrom(USER).where(USER.USER_ID.eq(userId)).fetchOne();
    }

    @Async
    public void updateLoginTime(UserRecord userRecord) {
        userRecord.setLastLoginTime(new Timestamp(System.currentTimeMillis()));
        userRecord.update();
    }

    public void saveUser(UserDto userDto) {
        UserRecord userRecord = create.newRecord(USER);
        BeanUtils.copyProperties(userDto, userRecord);
        userRecord.setCreateTime(new Timestamp(System.currentTimeMillis()));
        userRecord.setLastLoginTime(userRecord.getCreateTime());
        userRecord.insert();
    }
}
