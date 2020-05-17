package com.integration.socket.model.event;

import java.util.Random;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/17
 */
public class CreateItemEvent extends BaseEvent {
    private int refreshTimeout = 20;

    public CreateItemEvent() {
        //第一次30~60秒触发,之后每次加10秒
        resetTimeout();
    }

    public void resetTimeout() {
        refreshTimeout += 10;
        Random random = new Random();
        setTimeout((random.nextInt(refreshTimeout) + refreshTimeout) * 60);
    }
}
