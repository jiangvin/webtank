package com.integration.socket.service;

import com.integration.socket.model.bo.UserBo;
import com.integration.socket.model.dto.UserDto;
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

    void processNewUserReady(UserDto userDto) {
        if (userMap.containsKey(userDto.getUserId())) {
            return;
        }

        UserBo userBo = removeInCache(userDto.getUserId());
        if (userBo == null) {
            return;
        }

        userBo.setUserName(userDto.getUsername());
        userMap.put(userBo.getUserId(), userBo);
        log.info("userId:{} -> username:{}", userBo.getUserId(), userBo.getUserName());
        log.info("user:{} add into userMap(count:{})", userBo.getUserName(), userMap.size());
    }

    public void addNewUserCache(UserBo userBo) {
        if (newUserCache.containsKey(userBo.getUserId())) {
            return;
        }
        newUserCache.put(userBo.getUserId(), userBo);
        log.info("user:{} add into the cache(count:{})", userBo.getUserId(), newUserCache.size());
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

    void remove(String key) {
        removeInCache(key);
        removeInUserMap(key);
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

    private void removeInUserMap(String key) {
        if (!userMap.containsKey(key)) {
            return;
        }

        userMap.remove(key);
        log.info("user:{} remove in userMap(count:{})", key, userMap.size());
    }
}
