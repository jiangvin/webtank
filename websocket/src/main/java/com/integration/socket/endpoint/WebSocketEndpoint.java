package com.integration.socket.endpoint;

import com.integration.dto.message.MessageDto;
import com.integration.dto.message.MessageType;
import com.integration.socket.model.bo.SocketUserBo;
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
     * @param session
     */
    @OnOpen
    public void onOpen(Session session) throws IOException {
        SocketUserBo userBo = SocketUserBo.convertSocketUserBo(session);
        if (userBo == null) {
            return;
        }

        if (onlineUserService.exists(userBo.getUsername())) {
            userBo.sendMessage(new MessageDto("用户名重复", MessageType.ERROR_MESSAGE));
            userBo.disconnect();
            return;
        }

        onlineUserService.addNewUserCache(userBo);
    }

    /**
     * 连接关闭
     * @param session
     */
    @OnClose
    public void onClose(Session session) throws UnsupportedEncodingException {
        String username = SocketUserBo.getUsernameFromSession(session);
        if (username == null) {
            return;
        }

        gameService.removeUser(username);
    }

    /**
     * 接收到消息
     * @param text
     */
    @OnMessage
    public void onMsg(Session session, String text) throws IOException {
        String username = SocketUserBo.getUsernameFromSession(session);
        if (username == null) {
            return;
        }

        MessageDto messageDto = ObjectUtil.readValue(text, MessageDto.class);
        if (messageDto == null) {
            return;
        }

        try {
            gameService.receiveMessage(messageDto, username);
        } catch (Exception e) {
            log.error(String.format("username:%s catch error:", username), e);
            MessageDto errorDto = new MessageDto(e.getMessage(), MessageType.ERROR_MESSAGE);
            session.getBasicRemote().sendText(ObjectUtil.writeValue(errorDto));
        }
    }
}
