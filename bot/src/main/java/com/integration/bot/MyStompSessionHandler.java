package com.integration.bot;

import org.springframework.lang.Nullable;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandler;

import java.lang.reflect.Type;

public class MyStompSessionHandler implements StompSessionHandler {
    @Override
    public void afterConnected(StompSession session, StompHeaders connectedHeaders) {
        System.out.println("连接上了");
    }


    @Override
    public void handleException(StompSession session, @Nullable StompCommand command,
                                StompHeaders headers, byte[] payload, Throwable exception) {
        System.out.println("出错了:" + exception.getMessage());
    }

    @Override
    public void handleTransportError(StompSession session, Throwable exception) {
        System.out.println("出错了:" + exception.getMessage());
    }

    @Override
    public Type getPayloadType(StompHeaders headers) {
        return MessageDto.class;
    }

    @Override
    public void handleFrame(StompHeaders headers, @Nullable Object payload) {
        System.out.println("搞不懂:" + payload);
    }
}