package com.integration.socket.service;

import com.integration.socket.model.MessageType;
import com.integration.socket.model.dto.MessageDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

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
        sendMessage(messageDto, null);
    }

    public void sendMessage(MessageDto messageDto, String sendFrom) {
        log.info("send message:{} from:{}", messageDto.toString(), sendFrom);

        String sendTo = messageDto.getSendTo();
        if (StringUtils.isEmpty(sendTo)) {
            //发送给所有人
            simpMessagingTemplate.convertAndSend(
                TOPIC_PATH,
                messageDto);
        } else {
            //发送给指定用户
            simpMessagingTemplate.convertAndSendToUser(
                sendTo,
                QUEUE_PATH,
                messageDto);

            //补发给发送者一份
            if (StringUtils.isEmpty(sendFrom) || sendFrom.equals(sendTo)) {
                return;
            }
            simpMessagingTemplate.convertAndSendToUser(
                sendFrom,
                QUEUE_PATH,
                messageDto);
        }
    }

    void processUserMessage(MessageDto messageDto, String sendFrom) {
        if (StringUtils.isEmpty(messageDto.getSendTo())) {
            messageDto.setMessage(String.format("%s: %s", sendFrom, messageDto.getMessage()));
        } else {
            messageDto.setMessage(String.format("%s → %s: %s", sendFrom, messageDto.getSendTo(), messageDto.getMessage()));
        }
        sendMessage(messageDto);
    }

    void sendUserStatusAndMessage(List<String> users, String username, boolean isLeave) {
        //没人了，不用更新状态
        if (users.isEmpty()) {
            log.info("no user in service, no need to send message");
            return;
        }

        sendMessage(new MessageDto(users, MessageType.USERS));
        if (isLeave) {
            sendMessage(new MessageDto(String.format("%s 离开了! 当前人数: %d",
                                                     username,
                                                     users.size()),
                                       MessageType.SYSTEM_MESSAGE));
        } else {
            sendMessage(new MessageDto(String.format("%s 加入了! 当前人数: %d",
                                                     username,
                                                     users.size()),
                                       MessageType.SYSTEM_MESSAGE));
        }
    }
}
