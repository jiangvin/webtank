package com.integration.socket.model.event;

import com.integration.dto.message.MessageType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/15
 */

@Data
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class MessageEvent extends BaseEvent {
    private Object content;
    private MessageType messageType;
}
