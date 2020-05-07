package com.integration.socket.model.dto;

import com.integration.socket.model.MessageType;
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
@NoArgsConstructor
public class MessageDto {

    private Object message;

    private MessageType messageType = MessageType.SYSTEM_MESSAGE;

    private List<String> sendToList;

    public MessageDto(Object message, MessageType messageType) {
        init(message, messageType, null);
    }

    public MessageDto(Object message, MessageType messageType, String sendTo) {
        init(message, messageType, Collections.singletonList(sendTo));
    }

    public MessageDto(Object message, MessageType messageType, List<String> sendToList) {
        init(message, messageType, sendToList);
    }

    public boolean sendToAll() {
        return sendToList == null || sendToList.isEmpty();
    }

    private void init(Object message, MessageType messageType, List<String> sendToList) {
        this.message = message;
        this.messageType = messageType;
        this.sendToList = sendToList;
    }
}