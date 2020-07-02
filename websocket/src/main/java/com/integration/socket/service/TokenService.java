package com.integration.socket.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author 蒋文龙(Vin)
 * @description 确保幂等性操作服务
 * @date 2020/6/28
 */

@Slf4j
@Service
public class TokenService {

    /**
     * 过期时间10分钟
     */
    private static final int EXPIRED_TIME = 10 * 60 * 1000;

    private static final int MAX_TOKEN = 100;

    private Map<String, Long> tokenTimeMap = new ConcurrentHashMap<>();

    public String createToken() {
        clearTokenTimeMap();
        String token = UUID.randomUUID().toString().substring(0, 8);
        while (tokenTimeMap.containsKey(token)) {
            token = UUID.randomUUID().toString().substring(0, 8);
        }

        tokenTimeMap.put(token, System.currentTimeMillis());
        return token;
    }

    public boolean checkToken(String token) {
        if (tokenTimeMap.containsKey(token)) {
            tokenTimeMap.remove(token);
            return true;
        } else {
            return false;
        }
    }

    private void clearTokenTimeMap() {
        if (tokenTimeMap.size() < MAX_TOKEN) {
            return;
        }

        log.info("try to clear tokens:{}", tokenTimeMap.size());
        List<String> removeTokens = new ArrayList<>();
        long now = System.currentTimeMillis();
        for (Map.Entry<String, Long> kv : tokenTimeMap.entrySet()) {
            if (now - kv.getValue() > EXPIRED_TIME) {
                removeTokens.add(kv.getKey());
            }
        }
        for (String token : removeTokens) {
            tokenTimeMap.remove(token);
        }
        log.info("clear tokens finished:{}", tokenTimeMap.size());
    }
}
