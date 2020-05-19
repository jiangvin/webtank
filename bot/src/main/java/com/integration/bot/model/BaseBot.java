package com.integration.bot.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.integration.bot.handler.MessageReceiveHandler;
import com.integration.bot.model.event.BaseEvent;
import com.integration.bot.model.event.PauseCheckEvent;
import com.integration.bot.model.event.SendMessageEvent;
import com.integration.bot.model.event.UserCountCheckEvent;
import com.integration.bot.model.map.Tank;
import com.integration.bot.service.BotService;
import com.integration.bot.model.dto.BotDto;
import com.integration.dto.map.ItemDto;
import com.integration.dto.map.MapDto;
import com.integration.dto.map.MapUnitType;
import com.integration.dto.message.MessageDto;
import com.integration.dto.message.MessageType;
import com.integration.dto.room.RoomDto;
import com.integration.dto.room.TeamType;
import com.integration.util.CommonUtil;
import lombok.Getter;
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
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/15
 */

@Slf4j
public abstract class BaseBot {

    private static final int BOT_LIFETIME = 90 * 60 * 1000;

    private ObjectMapper objectMapper = new ObjectMapper();
    private String roomId;
    private boolean isPause = true;
    private List<BaseEvent> eventList = new ArrayList<>();
    private WebSocketStompClient stompClient;
    private StompSession stompSession;
    private TeamType teamType;

    @Getter
    String name;
    MapDto mapDto = new MapDto();
    Map<String, MapUnitType> unitMap = new ConcurrentHashMap<>();
    Map<String, Tank> tankMap = new ConcurrentHashMap<>();

    /**
     * 最多存活90分钟
     */
    private long startTime = System.currentTimeMillis();

    /**
     * 当只剩BOT一个人时结束
     */
    private Integer userCount;

    /**
     * 结束标记，控制结束逻辑
     */
    private boolean deadFlag = false;

    BaseBot(BotDto botDto) {
        this.name = botDto.getName();
        this.roomId = botDto.getRoomId();
        this.teamType = botDto.getTeamType();
        connect();
        if (isDead()) {
            return;
        }
        sendMessage(new MessageDto(null, MessageType.CLIENT_READY));
        RoomDto roomDto = new RoomDto();
        roomDto.setRoomId(this.roomId);
        roomDto.setJoinTeamType(this.teamType);
        MessageDto messageDto = new MessageDto(roomDto, MessageType.JOIN_ROOM);
        this.eventList.add(new SendMessageEvent(5 * 60, messageDto));
        this.eventList.add(new PauseCheckEvent());
    }

    public boolean update() {
        if (isDead()) {
            return false;
        }

        processEvent();

        if (isPause) {
            return true;
        }

        updateExtension();
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
        log.info("process event:{}", event.getClass().getSimpleName());
        if (event instanceof SendMessageEvent) {
            SendMessageEvent sendMessageEvent = (SendMessageEvent) event;
            sendMessage(sendMessageEvent.getMessage());
        } else if (event instanceof UserCountCheckEvent) {
            if (this.userCount <= 1) {
                UserCountCheckEvent userCountCheckEvent = (UserCountCheckEvent) event;
                if (userCountCheckEvent.isFinished()) {
                    log.info("bot:{} will be closed because no user in room.", this.name);
                    this.deadFlag = true;
                } else {
                    this.eventList.add(userCountCheckEvent);
                }
            }
        } else if (event instanceof PauseCheckEvent) {
            PauseCheckEvent pauseCheckEvent = (PauseCheckEvent) event;
            if (isPause) {
                if (pauseCheckEvent.isFinished()) {
                    log.info("bot:{} will be closed because game pause.", this.name);
                    this.deadFlag = true;
                } else {
                    this.eventList.add(pauseCheckEvent);
                }
            }
        }
    }

    public void receiveMessage(MessageDto messageDto) {
        log.info("receive message: {}", CommonUtil.ignoreNull(messageDto.toString()));

        if (!roomId.equals(messageDto.getRoomId())) {
            return;
        }

        switch (messageDto.getMessageType()) {
            case USERS:
                this.userCount = ((List) messageDto.getMessage()).size();
                if (this.userCount <= 1) {
                    eventList.add(new UserCountCheckEvent());
                }
                break;
            case MAP:
                processMap(objectMapper.convertValue(messageDto.getMessage(), MapDto.class));
                break;
            case REMOVE_MAP:
                String key = (String) messageDto.getMessage();
                unitMap.remove(key);
                break;
            case CLEAR_MAP:
                unitMap.clear();
                tankMap.clear();
                break;
            case TANKS:
                processTank(objectMapper.convertValue(messageDto.getMessage(), List.class));
                break;
            case REMOVE_TANK:
                ItemDto dto = objectMapper.convertValue(messageDto.getMessage(), ItemDto.class);
                tankMap.remove(dto.getId());
                break;
            case SERVER_READY:
                isPause = false;
                break;
            case GAME_STATUS:
                isPause = true;
                eventList.add(new PauseCheckEvent());
                break;
            default:
                break;
        }
    }

    private void processTank(List<Object> dtoList) {
        for (Object dto : dtoList) {
            Tank tank = Tank.convert(objectMapper.convertValue(dto, ItemDto.class));
            if (tankMap.containsKey(tank.getId()) && tankMap.get(tank.getId()).getTeamType() == this.teamType) {
                tankMap.get(tank.getId()).copyPropertyFromServer(tank);
            } else {
                tankMap.put(tank.getId(), tank);
            }
        }
    }

    private void processMap(MapDto mapDto) {
        if (mapDto.getWidth() != null) {
            this.mapDto.setWidth(mapDto.getWidth());
        }
        if (mapDto.getHeight() != null) {
            this.mapDto.setHeight(mapDto.getHeight());
        }
        if (mapDto.getMapId() != null) {
            this.mapDto.setMapId(mapDto.getMapId());
        }
        if (mapDto.getPlayerLife() != null) {
            this.mapDto.setPlayerLife(mapDto.getPlayerLife());
        }
        if (mapDto.getComputerLife() != null) {
            this.mapDto.setComputerLife(mapDto.getComputerLife());
        }
        if (mapDto.getItemList() != null && !mapDto.getItemList().isEmpty()) {
            processMapUnitList(mapDto.getItemList());
        }
    }

    private void processMapUnitList(List<ItemDto> unitList) {
        for (ItemDto itemDto : unitList) {
            MapUnitType unitType = MapUnitType.convert(Integer.parseInt(itemDto.getTypeId()));
            if (unitType == null) {
                continue;
            }
            this.unitMap.put(itemDto.getId(), unitType);
        }
    }

    void syncTank(Tank tank) {
        tank.run();
        tank.reloadBullet();

        if (tank.getOrientationType() == tank.getLastSendOrientation() && tank.getActionType() == tank.getLastSendAction()) {
            return;
        }

        tank.setLastSendOrientation(tank.getOrientationType());
        tank.setLastSendAction(tank.getActionType());
        sendTankControl(tank);
    }

    private void sendTankControl(Tank tank) {
        ItemDto dto = new ItemDto();
        dto.setId(tank.getId());
        dto.setOrientation(tank.getOrientationType().getValue());
        dto.setAction(tank.getActionType().getValue());
        dto.setX(tank.getX());
        dto.setY(tank.getY());
        sendMessage(new MessageDto(dto, MessageType.UPDATE_TANK_CONTROL));
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
            log.info("bot:{} will be closed because stomp connect was closed", getName());
            return true;
        }

        //机器人存活时间不得超过90分钟
        if (System.currentTimeMillis() - this.startTime >= BOT_LIFETIME) {
            log.info("bot:{} will be closed because lifetime more than 90 minutes", getName());
            return true;
        }
        return false;
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
            stompSession = stompClient.connect(BotService.serverAddress + name, messageReceiveHandler).get(1, TimeUnit.SECONDS);
            stompSession.subscribe("/topic/send", messageReceiveHandler);
            stompSession.subscribe("/user/queue/send", messageReceiveHandler);
        } catch (Exception e) {
            log.error("catch connect error:", e);
        }
    }
}
