package com.integration.socket.service;

import com.integration.dto.message.MessageDto;
import com.integration.dto.message.MessageType;
import com.integration.socket.model.bo.UserBo;
import com.integration.socket.model.bo.SocketUserBo;
import com.integration.util.CommonUtil;
import com.integration.util.object.ObjectUtil;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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
    private static final String QUEUE_PATH = "/queue/send";

    private static final int MAX_LOG_LENGTH = 256;

    @Autowired
    private OnlineUserService onlineUserService;

    private final SimpMessagingTemplate simpMessagingTemplate;

    public MessageService(SimpMessagingTemplate simpMessagingTemplate) {
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    public void sendMessage(MessageDto messageDto) {
        List<String> sendToList = messageDto.getSendToList();
        if (sendToList == null || sendToList.isEmpty()) {
            return;
        }

        String msg = CommonUtil.ignoreNull(messageDto.toString());
        if (msg.length() > MAX_LOG_LENGTH) {
            msg = msg.substring(0, MAX_LOG_LENGTH) + "...";
        }
        log.debug("send message:{}", msg);

        //清空原有人数，减少数据量
        messageDto.setSendToList(null);
        for (String sendTo : sendToList) {
            sendMessage(messageDto, sendTo);
        }
    }

    private void sendMessage(MessageDto messageDto, String userId) {
        UserBo userBo = onlineUserService.get(userId);
        if (userBo == null) {
            return;
        }

        try {
            if (userBo instanceof SocketUserBo) {
                synchronized (onlineUserService.get(userId)) {
                    ((SocketUserBo) userBo).getSession().getBasicRemote().sendText(ObjectUtil.writeValue(messageDto));
                }
            } else {
                simpMessagingTemplate.convertAndSendToUser(
                    userId,
                    QUEUE_PATH,
                    messageDto);
            }
        } catch (Exception e) {
            log.error("catch send user:{} message error:", userBo.getUsername(), e);
        }
    }

    public void sendReady(@NonNull String username, String roomId) {
        sendMessage(new MessageDto(null, MessageType.SERVER_READY, username, roomId));
    }
}
