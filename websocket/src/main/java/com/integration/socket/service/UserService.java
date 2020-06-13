package com.integration.socket.service;

import com.integration.socket.model.dto.UserDto;
import com.integration.socket.repository.dao.UserDao;
import com.integration.socket.repository.jooq.tables.records.UserRecord;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/13
 */

@Service
@Slf4j
public class UserService {

    @Autowired
    private UserDao userDao;

    public UserDto queryUser(String userId) {
        UserRecord userRecord = userDao.query(userId);
        if (userRecord == null) {
            return null;
        }
        userDao.updateLoginTime(userRecord);
        return UserDto.convert(userRecord);
    }

    public void saveUser(UserDto userDto) {
        userDao.saveUser(userDto);
    }
}
