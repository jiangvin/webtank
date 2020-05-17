package com.integration.bot.model.event;

import lombok.Getter;
import lombok.Setter;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/15
 */

public abstract class BaseEvent {
    @Getter
    @Setter
    long timeout;

    BaseEvent(long timeout) {
        this.timeout = timeout;
    }
}
