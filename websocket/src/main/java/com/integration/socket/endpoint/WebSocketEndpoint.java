package com.integration.socket.endpoint;

import com.integration.dto.message.MessageDto;
import com.integration.dto.message.MessageType;
import com.integration.socket.model.bo.WxUserBo;
import com.integration.socket.service.GameService;
import com.integration.socket.service.OnlineUserService;
import com.integration.util.object.ObjectUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.io.UnsupportedEncodingException;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/28
 */
@ServerEndpoint("/ws")
@Component
@Slf4j
@Lazy
public class WebSocketEndpoint {

    private OnlineUserService onlineUserService = (OnlineUserService) WebSocketContextAware.getApplicationContext().getBean("onlineUserService");

    private GameService gameService = (GameService) WebSocketContextAware.getApplicationContext().getBean("gameService");

    /**
     * 连接成功
     *
     * @param session
     */
    @OnOpen
    public void onOpen(Session session) throws IOException {
        WxUserBo userBo = WxUserBo.convertWxUserBo(session);
        if (userBo == null) {
            return;
        }

        if (onlineUserService.exists(userBo.getUserId())) {
            MessageDto messageDto = new MessageDto("用户名重复", MessageType.ERROR_MESSAGE);
            userBo.getSession().getBasicRemote().sendText(ObjectUtil.writeValue(messageDto));
            userBo.getSession().close();
            return;
        }

        onlineUserService.addNewUserCache(userBo);
    }

    /**
     * 连接关闭
     *
     * @param session
     */
    @OnClose
    public void onClose(Session session) throws UnsupportedEncodingException {
        String userId = WxUserBo.getUserIdFromSession(session);
        if (userId == null) {
            return;
        }

        gameService.removeUser(userId);
    }

    /**
     * 接收到消息
     *
     * @param text
     */
    @OnMessage
    public void onMsg(Session session, String text) throws UnsupportedEncodingException {
        String userId = WxUserBo.getUserIdFromSession(session);
        if (userId == null) {
            return;
        }

        MessageDto messageDto = ObjectUtil.readValue(text, MessageDto.class);
        if (messageDto == null) {
            return;
        }
        gameService.receiveMessage(messageDto, userId);
    }
}
