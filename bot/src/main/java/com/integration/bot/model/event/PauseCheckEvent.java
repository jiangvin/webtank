package com.integration.bot.model.event;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/16
 */
public class PauseCheckEvent extends BaseEvent {
    public PauseCheckEvent() {
        setTimeout(60 * 60);
    }
}
