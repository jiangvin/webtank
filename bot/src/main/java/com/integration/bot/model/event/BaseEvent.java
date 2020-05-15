package com.integration.bot.model.event;

import lombok.Data;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/15
 */

@Data
public abstract class BaseEvent {
    private long timeout;
}
