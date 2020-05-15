package com.integration.socket.service;

import com.integration.dto.message.MessageDto;
import com.integration.dto.message.MessageType;
import com.integration.util.CommonUtil;
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

    private static final int MAX_LOG_LENGTH = 256;

    private final SimpMessagingTemplate simpMessagingTemplate;

    public MessageService(SimpMessagingTemplate simpMessagingTemplate) {
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    public void sendMessage(MessageDto messageDto) {
        List<String> sendToList = messageDto.getSendToList();
        if (sendToList != null && sendToList.isEmpty()) {
            return;
        }

        String msg = CommonUtil.ignoreNull(messageDto.toString());
        if (msg.length() > MAX_LOG_LENGTH) {
            msg = msg.substring(0, MAX_LOG_LENGTH) + "...";
        }
        log.info("send message:{}", msg);

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

    public void sendReady(@NonNull String username, String roomId) {
        sendMessage(new MessageDto(null, MessageType.SERVER_READY, username, roomId));
    }
}
