package com.integration.bot.handler;

import com.integration.bot.model.BaseBot;
import com.integration.dto.message.MessageDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandler;

import java.lang.reflect.Type;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/15
 */

@Slf4j
public class MessageReceiveHandler implements StompSessionHandler {

    private BaseBot baseBot;

    public MessageReceiveHandler(BaseBot baseBot) {
        this.baseBot = baseBot;
    }

    @Override
    public void afterConnected(@NonNull StompSession session, @NonNull StompHeaders connectedHeaders) {
        log.info("connect:{} successfully!", session.getSessionId());
    }


    @Override
    public void handleException(@NonNull StompSession session,
                                StompCommand command,
                                @NonNull StompHeaders headers,
                                @NonNull byte[] payload,
                                @NonNull Throwable exception) {
        log.error("catch stomp error:", exception);
    }

    @Override
    public void handleTransportError(@NonNull StompSession session,
                                     @NonNull Throwable exception) {
        log.error("catch stomp error:", exception);
    }

    @Override
    @NonNull
    public Type getPayloadType(@NonNull StompHeaders headers) {
        return MessageDto.class;
    }

    @Override
    public void handleFrame(@NonNull StompHeaders headers, @Nullable Object payload) {
        if (payload == null) {
            return;
        }
        baseBot.receiveMessage((MessageDto) payload);
    }
}
