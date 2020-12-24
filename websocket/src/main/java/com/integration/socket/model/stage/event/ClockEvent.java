package com.integration.socket.model.stage.event;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/23
 */
public class ClockEvent extends BaseEvent {
    public ClockEvent() {
        setTimeout(15 * 60);
    }
}
