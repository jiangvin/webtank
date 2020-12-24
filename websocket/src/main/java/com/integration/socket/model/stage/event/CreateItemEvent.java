package com.integration.socket.model.stage.event;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/17
 */
public class CreateItemEvent extends BaseEvent {
    private int refreshTimeout = 15;

    public CreateItemEvent() {
        resetTimeout();
    }

    public void resetTimeout() {
        refreshTimeout += 5;
        setTimeout(refreshTimeout * 60);
    }
}
