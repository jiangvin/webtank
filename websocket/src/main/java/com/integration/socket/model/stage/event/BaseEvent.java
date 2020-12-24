package com.integration.socket.model.stage.event;

import lombok.Data;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/13
 */
@Data
public abstract class BaseEvent {
    private long timeout = 0;

    private String usernameCheck;
}
