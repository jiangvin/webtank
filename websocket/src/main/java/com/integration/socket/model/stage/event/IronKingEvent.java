package com.integration.socket.model.stage.event;

import lombok.Getter;

import java.util.List;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/8
 */
public class IronKingEvent extends BaseEvent {

    @Getter
    private List<String> keys;

    public IronKingEvent(List<String> keys) {
        this.keys = keys;
        setTimeout(30 * 60);
    }
}
