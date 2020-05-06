package com.integration.socket.service;

import com.integration.socket.model.UserReadyResult;
import com.integration.socket.model.bo.UserBo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
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
    private ConcurrentHashMap <String, UserBo> newUserCache = new ConcurrentHashMap<>();

    public boolean exists(String key) {
        return userMap.containsKey(key);
    }

    UserReadyResult processNewUserReady(String username) {
        if (userMap.containsKey(username)) {
            return UserReadyResult.ALREADY_EXISTS;
        }

        UserBo userBo = removeInCache(username);
        if (userBo == null) {
            return UserReadyResult.NONE;
        }

        userMap.put(userBo.getUsername(), userBo);
        log.info("user:{} add into userMap(count:{})", username, userMap.size());
        return UserReadyResult.ADD_USER;
    }

    public void addNewUserCache(UserBo userBo) {
        if (newUserCache.containsKey(userBo.getUsername())) {
            return;
        }
        newUserCache.put(userBo.getUsername(), userBo);
        log.info("user:{} add into the cache(count:{})", userBo.getUsername(), newUserCache.size());
    }

    public void subscribeInUserCache(String username, String destination) {
        if (!newUserCache.containsKey(username)) {
            return;
        }
        UserBo userBo = newUserCache.get(username);
        if (userBo.getSubscribeList().contains(destination)) {
            return;
        }

        log.info("user:{} subscribe the path:{}", username, destination);
        userBo.getSubscribeList().add(destination);
    }

    boolean remove(String key) {
        removeInCache(key);
        return removeInUserMap(key);
    }

    UserBo get(String key) {
        return userMap.get(key);
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

    private boolean removeInUserMap(String key) {
        if (!userMap.containsKey(key)) {
            return false;
        }

        userMap.remove(key);
        log.info("user:{} remove in userMap(count:{})", key, userMap.size());
        return true;
    }
}
