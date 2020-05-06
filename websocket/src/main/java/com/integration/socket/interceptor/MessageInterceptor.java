package com.integration.socket.interceptor;

import com.integration.socket.model.bo.UserBo;
import com.integration.socket.service.GameService;
import com.integration.socket.service.OnlineUserService;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

import java.security.Principal;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/4/26
 */

@Component
@Slf4j
public class MessageInterceptor implements ChannelInterceptor {

    private final GameService gameService;
    private final OnlineUserService onlineUserService;

    public MessageInterceptor(@Lazy GameService gameService,
                              OnlineUserService onlineUserService) {
        this.gameService = gameService;
        this.onlineUserService = onlineUserService;
    }

    @SneakyThrows
    @Override
    public void afterSendCompletion(Message<?> message, MessageChannel channel, boolean sent, Exception ex) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        StompCommand command = accessor.getCommand();
        Principal principal = accessor.getUser();
        if (principal == null || principal.getName() == null) {
            return;
        }

        String username = principal.getName();
        if (StompCommand.CONNECT.equals(command)) {
            onlineUserService.addNewUserCache(new UserBo(username, accessor.getSessionId()));
        } else if (StompCommand.SUBSCRIBE.equals(command)) {
            String destination = accessor.getDestination();
            onlineUserService.subscribeInUserCache(username, destination);
        } else if (StompCommand.DISCONNECT.equals(command)) {
            gameService.removeUser(username);
        } else if (!StompCommand.SEND.equals(command)) {
            //send类型在controller里面单独处理
            log.info("user:{} send nonsupport command:{}", username, command);
        }
    }
}
