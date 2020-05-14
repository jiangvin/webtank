package com.integration.socket.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
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

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@NoArgsConstructor
public class MessageDto {

    private Object message;

    private MessageType messageType = MessageType.SYSTEM_MESSAGE;

    private List<String> sendToList;

    /**
     * 消息房间号，防止场景切换的中途带来的消息干扰
     */
    private String roomId;

    private String note;

    public MessageDto(Object message, MessageType messageType) {
        init(message, messageType, null, null, null);
    }

    public MessageDto(Object message, MessageType messageType, String sendTo) {
        init(message, messageType, Collections.singletonList(sendTo), null, null);
    }

    public MessageDto(Object message, MessageType messageType, String sendTo, String roomId) {
        init(message, messageType, Collections.singletonList(sendTo), roomId, null);
    }

    public MessageDto(Object message, MessageType messageType, List<String> sendToList, String roomId) {
        init(message, messageType, sendToList, roomId, null);
    }

    public MessageDto(Object message, MessageType messageType, List<String> sendToList, String roomId, String note) {
        init(message, messageType, sendToList, roomId, note);
    }

    private void init(Object message, MessageType messageType, List<String> sendToList, String roomId, String note) {
        this.message = message;
        this.messageType = messageType;
        this.sendToList = sendToList;
        this.roomId = roomId;
        this.note = note;
    }
}