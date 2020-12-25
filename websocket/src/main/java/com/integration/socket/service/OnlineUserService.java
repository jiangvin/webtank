package com.integration.socket.service;

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
    private ConcurrentHashMap<String, UserBo> userMap = new ConcurrentHashMap<>();

    /**
     * 缓存新用户，当用户返回ready消息时才放入game中
     */
    private ConcurrentHashMap<String, UserBo> newUserCache = new ConcurrentHashMap<>();

    @Autowired
    private UserDao userDao;

    public boolean exists(String key) {
        return userMap.containsKey(key);
    }

    void processNewUserReady(String username) {
        if (userMap.containsKey(username)) {
            return;
        }

        UserBo userBo = removeInCache(username);
        if (userBo == null) {
            return;
        }

        if (userBo.hasUserId()) {
            userBo.setUserRecord(userDao.queryUser(userBo.getUserId()));
        }

        userMap.put(userBo.getUsername(), userBo);
        log.info("user:{} add into userMap(count:{})", userBo.getUsername(), userMap.size());
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
        return userMap.get(key);
    }

    UserBo getFormUserId(String userId) {
        for (Map.Entry<String, UserBo> kv : userMap.entrySet()) {
            if (kv.getValue().getUserId() == null) {
                continue;
            }
            if (userId.equals(kv.getValue().getUserId())) {
                return kv.getValue();
            }
        }
        return null;
    }

    public List<String> getUserList() {
        List<String> users = new ArrayList<>();
        userMap.forEach((key, value) -> users.add(key));
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
        if (!userMap.containsKey(key)) {
            return null;
        }

        UserBo userBo = userMap.get(key);
        userMap.remove(key);
        log.info("user:{} remove in userMap(count:{})", key, userMap.size());
        return userBo;
    }
}
