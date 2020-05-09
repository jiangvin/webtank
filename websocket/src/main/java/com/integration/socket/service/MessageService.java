package com.integration.socket.service;

import com.integration.socket.model.MessageType;
import com.integration.socket.model.dto.MessageDto;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author 蒋文龙(Vin)
 * @description 懒加载模式，避免循环依赖
 * @date 2020/4/26
 */

@Service
@Slf4j
public class MessageService {

    private static final String TOPIC_PATH = "/topic/send";

    private static final String QUEUE_PATH = "/queue/send";

    private final SimpMessagingTemplate simpMessagingTemplate;

    public MessageService(SimpMessagingTemplate simpMessagingTemplate) {
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    public void sendMessage(MessageDto messageDto) {
        List<String> sendToList = messageDto.getSendToList();
        if (sendToList != null && sendToList.isEmpty()) {
            return;
        }

        log.info("send message:{}", messageDto.toString());

        if (sendToList == null) {
            simpMessagingTemplate.convertAndSend(
                TOPIC_PATH,
                messageDto);
        } else {
            for (String sendTo : sendToList) {
                simpMessagingTemplate.convertAndSendToUser(
                    sendTo,
                    QUEUE_PATH,
                    messageDto);
            }
        }
    }

    public void sendReady(@NonNull String username) {
        sendMessage(new MessageDto(null, MessageType.SERVER_READY, username));
    }
}
