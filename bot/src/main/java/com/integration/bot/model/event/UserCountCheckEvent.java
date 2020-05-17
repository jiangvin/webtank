package com.integration.bot.model.event;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/15
 */
public class UserCountCheckEvent extends BaseLoopEvent {
    public UserCountCheckEvent() {
        super(10 * 60, 3);
    }
}
