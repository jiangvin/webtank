package com.integration.socket.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/17
 */

@Service
@Slf4j
public class MapStarService {

    private static int TWO_STAR_LIMIT = 2;

    public int getStarCount(int deadCount) {
        if (deadCount == 0) {
            return 3;
        }
        if (deadCount <= TWO_STAR_LIMIT) {
            return 2;
        } else {
            return 1;
        }
    }
}
