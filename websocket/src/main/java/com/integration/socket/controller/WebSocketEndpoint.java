package com.integration.socket.controller;

import org.springframework.stereotype.Component;

import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/28
 */
@ServerEndpoint("/ws")
@Component
public class WebSocketEndpoint {
    /**
     * 连接成功
     *
     * @param session
     */
    @OnOpen
    public void onOpen(Session session) throws IOException {
        System.out.println("连接成功");
        session.getBasicRemote().sendText("你是谁？");
    }

    /**
     * 连接关闭
     *
     * @param session
     */
    @OnClose
    public void onClose(Session session) {
        System.out.println("连接关闭");
    }

    /**
     * 接收到消息
     *
     * @param text
     */
    @OnMessage
    public String onMsg(Session session, String text) {
        return "servet 发送：" + text;
    }
}
