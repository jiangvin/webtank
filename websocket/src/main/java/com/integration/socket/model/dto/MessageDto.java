package com.integration.socket.model.dto;

import com.integration.socket.model.MessageType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/4/23
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageDto {

    private Object message;

    private MessageType messageType = MessageType.USER_MESSAGE;

    private String sendTo;

    public MessageDto(Object message) {
        this.message = message;
    }

    public MessageDto(Object message, MessageType messageType) {
        this.message = message;
        this.messageType = messageType;
    }
}