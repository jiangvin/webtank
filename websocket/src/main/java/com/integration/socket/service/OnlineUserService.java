package com.integration.socket.service;

import com.integration.dto.message.MessageDto;
import com.integration.dto.message.MessageType;
import com.integration.socket.model.bo.UserBo;
import com.integration.socket.repository.dao.UserDao;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author 蒋文龙(Vin)
 * @description socket连接管理服务
 * @date 2020/4/23
 */

@Service
@Slf4j
public class OnlineUserService {
    private Map<String, UserBo> userNameMap = new ConcurrentHashMap<>();

    private Map<String, UserBo> userIdMap = new ConcurrentHashMap<>();

    /**
     * 缓存新用户，当用户返回ready消息时才放入game中
     */
    private ConcurrentHashMap<String, UserBo> newUserCache = new ConcurrentHashMap<>();

    @Autowired
    private UserDao userDao;

    public boolean exists(String key) {
        return userNameMap.containsKey(key);
    }

    void processNewUserReady(String username) {
        if (userNameMap.containsKey(username)) {
            return;
        }

        UserBo userBo = removeInCache(username);
        if (userBo == null) {
            return;
        }

        if (userBo.hasUserId()) {
            UserBo oldUser = getFormUserId(userBo.getUserId());
            if (oldUser != null) {
                oldUser.sendMessage(new MessageDto("您的账号在其他地方登录!", MessageType.SYSTEM_MESSAGE));
                oldUser.disconnect();
            }
            userBo.setUserRecord(userDao.queryUser(userBo.getUserId()));
            userIdMap.put(userBo.getUserId(), userBo);
        }

        userNameMap.put(userBo.getUsername(), userBo);
        log.info("user:{} add into userMap(count:{})", userBo.getUsername(), userNameMap.size());
    }

    public void addNewUserCache(UserBo userBo) {
        if (newUserCache.containsKey(userBo.getUsername())) {
            return;
        }

        newUserCache.put(userBo.getUsername(), userBo);
        log.info("user:{} add into the cache(count:{})", userBo.getUsername(), newUserCache.size());
    }

    UserBo remove(String key) {
        removeInCache(key);
        return removeInUserMap(key);
    }

    UserBo get(String key) {
        return userNameMap.get(key);
    }

    UserBo getFormUserId(String userId) {
        return userIdMap.get(userId);
    }

    public List<String> getUserList() {
        List<String> users = new ArrayList<>();
        userNameMap.forEach((key, value) -> users.add(key));
        return users;
    }

    private UserBo removeInCache(String key) {
        if (!newUserCache.containsKey(key)) {
            return null;
        }

        UserBo userBo = newUserCache.get(key);
        newUserCache.remove(key);
        log.info("user:{} remove in cache(count:{})", key, newUserCache.size());
        return userBo;
    }

    private UserBo removeInUserMap(String key) {
        if (!userNameMap.containsKey(key)) {
            return null;
        }

        UserBo userBo = userNameMap.get(key);
        userNameMap.remove(key);
        if (userBo.hasUserId()) {
            userIdMap.remove(userBo.getUserId());
        }
        log.info("user:{} remove in userMap(count:{})", key, userNameMap.size());
        return userBo;
    }
}
