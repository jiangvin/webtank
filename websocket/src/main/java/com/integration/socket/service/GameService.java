package com.integration.socket.service;

import com.integration.socket.model.MessageType;
import com.integration.socket.model.UserReadyResult;
import com.integration.socket.model.bo.UserBo;
import com.integration.socket.model.dto.MessageDto;
import com.integration.socket.model.dto.RoomDto;
import com.integration.socket.model.dto.RoomListDto;
import com.integration.socket.stage.BaseStage;
import com.integration.socket.stage.StageMenu;
import com.integration.socket.stage.StageRoom;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author 蒋文龙(Vin)
 * @description 游戏的主体函数
 * @date 2020/5/3
 */

@Service
@Slf4j
public class GameService {

    /**
     * 用户管理
     */
    @Autowired
    private OnlineUserService onlineUserService;

    /**
     * 消息发送，接收管理
     */
    @Autowired
    private MessageService messageService;

    /**
     * 布景管理
     */
    private BaseStage menu;
    private ConcurrentHashMap<String, BaseStage> roomMap = new ConcurrentHashMap<>();

    /**
     * 新增List来保证rooms的顺序
     * 顺序 旧 -> 新
     */
    private List<StageRoom> roomList = new ArrayList<>();

    @PostConstruct
    private void init() {
        initStage();
    }

    private void initStage() {
        menu = new StageMenu(messageService);
    }

    public void subscribeInUserCache(String username, String destination) {
        onlineUserService.subscribeInUserCache(username, destination);
    }

    public void addNewUserCache(UserBo userBo) {
        onlineUserService.addNewUserCache(userBo);
    }

    public void removeUser(String username) {
        UserBo userBo = onlineUserService.get(username);
        if (userBo == null) {
            return;
        }

        onlineUserService.remove(username);
        messageService.sendUserStatusAndMessage(onlineUserService.getUserList(), username, true);
        BaseStage stage = currentStage(userBo);
        if (stage == null) {
            return;
        }
        stage.remove(username);

        //房间为空时删除房间
        if (!(stage instanceof StageRoom)) {
            return;
        }
        StageRoom room = (StageRoom) stage;
        if (room.getUserCount() != 0) {
            return;
        }
        roomMap.remove(room.getRoomId());
        roomList.remove(room);
    }

    public boolean roomNameExists(String roomName) {
        return roomMap.containsKey(roomName);
    }

    public void receiveMessage(MessageDto messageDto, String sendFrom) {
        //新用户加入时处理，不需要检查用户是否存在
        if (messageDto.getMessageType() == MessageType.READY) {
            processNewUserReady(sendFrom);
            return;
        }

        UserBo userBo = userCheckAndGetSendFrom(messageDto, sendFrom);
        if (userBo == null) {
            return;
        }

        log.info("receive:{} from user:{}", messageDto.toString(), sendFrom);
        switch (messageDto.getMessageType()) {
            case USER_MESSAGE:
                messageService.processUserMessage(messageDto, sendFrom);
                break;
            default:
                currentStage(userBo).processMessage(messageDto, sendFrom);
                break;
        }
    }

    public RoomListDto getRoomListDto(int start, int limit) {
        List<RoomDto> roomDtoList = new ArrayList<>();
        for (StageRoom room : roomList.subList(start, Math.min(start + limit, roomList.size()))) {
            roomDtoList.add(RoomDto.convert(room));
        }
        return new RoomListDto(roomDtoList, roomList.size());
    }

    @Scheduled(fixedDelay = 17)
    public void update() {
        menu.update();
        for (Map.Entry<String, BaseStage> kv : roomMap.entrySet()) {
            kv.getValue().update();
        }
    }

    private BaseStage currentStage(UserBo userBo) {
        if (!StringUtils.isEmpty(userBo.getRoomId())) {
            if (!roomMap.containsKey(userBo.getRoomId())) {
                log.warn("can not find room:{} from user:{}", userBo.getRoomId(), userBo.getUsername());
            }
            return roomMap.get(userBo.getRoomId());
        } else {
            return menu;
        }
    }

    private UserBo userCheckAndGetSendFrom(MessageDto messageDto, String sendFrom) {
        //检查接收方
        if (!StringUtils.isEmpty(messageDto.getSendTo()) && !onlineUserService.exists(messageDto.getSendTo())) {
            return null;
        }

        //检查发送方
        return onlineUserService.get(sendFrom);
    }

    private void processNewUserReady(String username) {
        UserReadyResult result = onlineUserService.processNewUserReady(username);
        switch (result) {
            case ADD_USER:
                //第一次加入，广播所有用户玩家信息
                messageService.sendUserStatusAndMessage(onlineUserService.getUserList(), username, false);
                break;
            case ALREADY_EXISTS:
                //已经加入了，单独给用户再同步一次玩家信息
                messageService.sendMessage(new MessageDto(onlineUserService.getUserList(), MessageType.USERS, username));
                break;
            default:
                break;
        }
    }
}
