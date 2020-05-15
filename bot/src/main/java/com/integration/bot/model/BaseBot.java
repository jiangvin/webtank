package com.integration.bot.model;

import com.integration.bot.handler.MessageReceiveHandler;
import com.integration.bot.model.event.BaseEvent;
import com.integration.bot.model.event.UserCheckEvent;
import com.integration.dto.bot.RequestBotDto;
import com.integration.dto.message.MessageDto;
import com.integration.dto.message.MessageType;
import com.integration.dto.room.RoomDto;
import com.integration.dto.room.TeamType;
import com.integration.util.CommonUtil;
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

    private static final int BOT_LIFETIME = 90 * 60 * 1000;

    private String name;
    private String roomId;
    private TeamType teamType;

    /**
     * 最多存活90分钟
     */
    private long startTime = System.currentTimeMillis();

    /**
     * 当只剩BOT一个人时，2分钟后结束
     */
    private Integer userCount;

    private boolean deadFlag = false;

    private List<BaseEvent> eventList = new ArrayList<>();

    private WebSocketStompClient stompClient;
    private StompSession stompSession;

    BaseBot(RequestBotDto requestBotDto) {
        this.name = requestBotDto.getName();
        this.roomId = requestBotDto.getRoomId();
        this.teamType = requestBotDto.getTeamType();
        connect();
        if (isDead()) {
            return;
        }
        sendMessage(new MessageDto(null, MessageType.CLIENT_READY));
        RoomDto roomDto = new RoomDto();
        roomDto.setRoomId(this.roomId);
        roomDto.setJoinTeamType(this.teamType);
        sendMessage(new MessageDto(roomDto, MessageType.JOIN_ROOM));
    }

    public boolean update() {
        if (isDead()) {
            return false;
        }

        processEvent();


        return true;
    }

    /**
     * 运算的扩展函数
     */
    abstract void updateExtension();

    private void processEvent() {
        if (eventList.isEmpty()) {
            return;
        }

        for (int i = 0; i < eventList.size(); ++i) {
            BaseEvent event = eventList.get(i);
            if (event.getTimeout() == 0) {
                processEvent(event);
                eventList.remove(i);
                --i;
            } else {
                event.setTimeout(event.getTimeout() - 1);
            }
        }
    }

    private void processEvent(BaseEvent event) {
        if (event instanceof UserCheckEvent) {
            if (this.userCount <= 1) {
                log.info("bot:{} will be closed because no user in room.", this.name);
                this.deadFlag = true;
            }
        }
    }

    public void receiveMessage(MessageDto messageDto) {
        log.info("receive message: {}", CommonUtil.ignoreNull(messageDto.toString()));
        switch (messageDto.getMessageType()) {
            case USERS:
                this.userCount = ((List) messageDto.getMessage()).size();
                if (this.userCount <= 1) {
                    UserCheckEvent userCheckEvent = new UserCheckEvent();
                    userCheckEvent.setTimeout(2 * 60 * 6);
                    eventList.add(userCheckEvent);
                }
                break;
            default:
                break;
        }
    }

    void sendMessage(MessageDto messageDto) {
        log.info("send message: {}", CommonUtil.ignoreNull(messageDto.toString()));
        stompSession.send("/send", messageDto);
    }

    public boolean isDead() {
        if (deadFlag) {
            return true;
        }

        if (stompClient == null || stompSession == null || !stompSession.isConnected()) {
            return true;
        }

        //机器人存活时间不得超过90分钟
        return System.currentTimeMillis() - this.startTime >= BOT_LIFETIME;
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
