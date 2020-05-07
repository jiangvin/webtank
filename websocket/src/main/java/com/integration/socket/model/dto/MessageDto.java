package com.integration.socket.model.dto;

import com.integration.socket.model.MessageType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;

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

    private MessageType messageType = MessageType.SYSTEM_MESSAGE;

    private List<String> sendToList;

    public MessageDto(Object message, MessageType messageType) {
        this.message = message;
        this.messageType = messageType;
    }

    public MessageDto(Object message, MessageType messageType, String sendTo) {
        this.message = message;
        this.messageType = messageType;
        this.sendToList = Collections.singletonList(sendTo);
    }

    public boolean sendToAll() {
        return sendToList == null || sendToList.isEmpty();
    }
}