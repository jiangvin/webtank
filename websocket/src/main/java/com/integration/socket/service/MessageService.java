package com.integration.socket.service;

import com.integration.dto.message.MessageDto;
import com.integration.socket.model.bo.UserBo;
import com.integration.util.CommonUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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
    private static final int MAX_LOG_LENGTH = 256;

    @Autowired
    private OnlineUserService onlineUserService;

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

        userBo.sendMessage(messageDto);
    }
}
