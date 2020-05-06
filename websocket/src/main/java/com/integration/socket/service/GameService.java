package com.integration.socket.service;

import com.integration.socket.model.MessageType;
import com.integration.socket.model.UserReadyResult;
import com.integration.socket.model.bo.UserBo;
import com.integration.socket.model.dto.MessageDto;
import com.integration.socket.model.dto.RoomDto;
import com.integration.socket.stage.BaseStage;
import com.integration.socket.stage.StageMenu;
import com.integration.socket.stage.StageRoom;
import com.integration.util.model.CustomException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.annotation.PostConstruct;

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

    @Autowired
    private RoomService roomService;

    /**
     * 布景管理
     */
    private BaseStage menu;

    @PostConstruct
    private void init() {
        initStage();
    }

    private void initStage() {
        menu = new StageMenu(messageService);
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

        log.info("room:{} will be removed", room.getRoomId());
        roomService.remove(room);
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

    public void createRoom(RoomDto roomDto, String sessionId) {
        //check user
        UserBo userBo = onlineUserService.get(roomDto.getCreator());
        if (userBo == null) {
            throw new CustomException("用户不存在:" + roomDto.getCreator());
        }
        if (!userBo.getSocketSessionId().equals(sessionId)) {
            throw new CustomException("用户信息验证不通过!");
        }

        roomService.create(roomDto, userBo);
    }

    @Scheduled(fixedDelay = 17)
    public void update() {
        menu.update();
        roomService.update();
    }

    private BaseStage currentStage(UserBo userBo) {
        if (!StringUtils.isEmpty(userBo.getRoomId())) {
            if (!roomService.roomNameExists(userBo.getRoomId())) {
                log.warn("can not find room:{} from user:{}", userBo.getRoomId(), userBo.getUsername());
            }
            return roomService.get(userBo.getRoomId());
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
