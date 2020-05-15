package com.integration.bot.model;

import com.integration.bot.handler.MessageReceiveHandler;
import com.integration.dto.bot.RequestBotDto;
import com.integration.dto.message.MessageDto;
import com.integration.dto.message.MessageType;
import com.integration.dto.room.RoomDto;
import com.integration.dto.room.TeamType;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.Transport;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

import javax.websocket.ContainerProvider;
import javax.websocket.WebSocketContainer;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/15
 */

@Data
@Slf4j
public abstract class BaseBot {

    private static final String SOCKET_URL = "http://localhost/websocket-simple?name=";

    private String name;
    private String roomId;
    private TeamType teamType;

    private WebSocketStompClient stompClient;
    private StompSession stompSession;

    BaseBot(RequestBotDto requestBotDto) {
        this.name = requestBotDto.getName();
        this.roomId = requestBotDto.getRoomId();
        this.teamType = requestBotDto.getTeamType();
        connect();
        if (!isAlive()) {
            return;
        }
        sendMessage(new MessageDto(null, MessageType.CLIENT_READY));
        RoomDto roomDto = new RoomDto();
        roomDto.setRoomId(this.roomId);
        roomDto.setJoinTeamType(this.teamType);
        sendMessage(new MessageDto(roomDto, MessageType.JOIN_ROOM));
    }

    public boolean update() {
        if (!isAlive()) {
            return false;
        }

        return true;
    }

    /**
     * 运算的扩展函数
     */
    abstract void updateExtension();

    public void receiveMessage(MessageDto messageDto) {
        log.info("receive message: {}", messageDto.toString());
    }

    void sendMessage(MessageDto messageDto) {
        log.info("send message: {}", messageDto.toString());
        stompSession.send("/send", messageDto);
    }

    public boolean isAlive() {
        return stompClient != null && stompSession != null && stompSession.isConnected();
    }

    public void close() {
        if (stompSession != null && stompSession.isConnected()) {
            stompSession.disconnect();
        }
        if (stompClient != null) {
            stompClient.stop();
        }
    }

    private void connect() {
        List<Transport> transports = new ArrayList<>();

        WebSocketContainer container = ContainerProvider.getWebSocketContainer();
        container.setDefaultMaxTextMessageBufferSize(512 * 1024);
        WebSocketClient wsClient = new StandardWebSocketClient(container);
        transports.add(new WebSocketTransport(wsClient));

        WebSocketClient transport = new SockJsClient(transports);
        stompClient = new WebSocketStompClient(transport);
        stompClient.setMessageConverter(new MappingJackson2MessageConverter());
        ThreadPoolTaskScheduler taskScheduler = new ThreadPoolTaskScheduler();
        taskScheduler.afterPropertiesSet();
        stompClient.setTaskScheduler(taskScheduler);
        MessageReceiveHandler messageReceiveHandler = new MessageReceiveHandler(this);
        try {
            stompSession = stompClient.connect(SOCKET_URL + name, messageReceiveHandler).get(1, TimeUnit.SECONDS);
            stompSession.subscribe("/topic/send", messageReceiveHandler);
            stompSession.subscribe("/user/queue/send", messageReceiveHandler);
        } catch (Exception e) {
            log.error("catch connect error:", e);
        }
    }
}
