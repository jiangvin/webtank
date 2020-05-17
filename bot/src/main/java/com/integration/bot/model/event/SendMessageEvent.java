package com.integration.bot.model.event;

import com.integration.dto.message.MessageDto;
import lombok.Getter;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/17
 */
public class SendMessageEvent extends BaseEvent {
    @Getter
    private MessageDto message;

    public SendMessageEvent(long timeout, MessageDto message) {
        super(timeout);
        this.message = message;
    }
}
