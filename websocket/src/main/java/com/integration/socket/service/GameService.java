package com.integration.socket.service;

import com.integration.dto.message.MessageDto;
import com.integration.dto.message.MessageType;
import com.integration.dto.room.RoomDto;
import com.integration.socket.model.bo.UserBo;
import com.integration.socket.model.dto.UserDto;
import com.integration.socket.model.stage.BaseStage;
import com.integration.socket.model.stage.StageRoom;
import com.integration.util.CommonUtil;
import com.integration.util.model.CustomException;
import com.integration.util.object.ObjectUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.annotation.PostConstruct;
import java.util.List;

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

    @PostConstruct
    private void init() {

    }

    public void removeUser(String username) {
        UserBo userBo = onlineUserService.get(username);
        if (userBo == null) {
            return;
        }

        BaseStage stage = currentStage(userBo);
        if (stage == null) {
            return;
        }

        onlineUserService.remove(username);
        stage.removeUser(username);
        sendUserStatusAndMessage(username, true);

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
        if (messageDto.getMessageType() == MessageType.CLIENT_READY) {
            processNewUserReady(messageDto, sendFrom);
            return;
        }

        UserBo userBo = userCheckAndGetSendFrom(messageDto, sendFrom);
        if (userBo == null) {
            return;
        }

        log.info("receive:{} from user:{}", CommonUtil.ignoreNull(messageDto.toString()), sendFrom);
        switch (messageDto.getMessageType()) {
            case USER_MESSAGE:
                processUserMessage(messageDto, sendFrom);
                break;
            case CREATE_ROOM:
                createRoom(messageDto, sendFrom);
                break;
            case JOIN_ROOM:
                joinRoom(messageDto, sendFrom);
            default:
                BaseStage stage = currentStage(userBo);
                if (stage != null) {
                    stage.processMessage(messageDto, sendFrom);
                }
                break;
        }
    }

    private void processUserMessage(MessageDto messageDto, String sendFrom) {
        List<String> sendToList = messageDto.getSendToList();
        if (sendToList != null && sendToList.isEmpty()) {
            return;
        }

        if (sendToList == null) {
            messageDto.setMessage(String.format("%s: %s", sendFrom, messageDto.getMessage()));
            messageService.sendMessage(messageDto);
        } else {
            //先给发送方回复一份
            String messageToSendFrom = String.format("%s → %s: %s", sendFrom, messageDto.getSendToList().toString(), messageDto.getMessage());
            messageService.sendMessage(new MessageDto(messageToSendFrom, messageDto.getMessageType(), sendFrom));

            //再给所有接送者发送一份
            for (String sendTo : messageDto.getSendToList()) {
                if (sendFrom.equals(sendTo)) {
                    continue;
                }

                String sendMessage = String.format("%s → %s: %s", sendFrom, sendTo, messageDto.getMessage());
                messageService.sendMessage(new MessageDto(sendMessage, messageDto.getMessageType(), sendTo));
            }
        }
    }

    private void createRoom(MessageDto messageDto, String sendFrom) {
        RoomDto roomDto = ObjectUtil.readValue(messageDto.getMessage(), RoomDto.class);
        if (roomDto == null) {
            return;
        }
        roomDto.setCreator(sendFrom);

        //check user
        UserBo userBo = onlineUserService.get(roomDto.getCreator());
        if (userBo == null) {
            throw new CustomException("用户不存在:" + roomDto.getCreator());
        }

        StageRoom room = roomService.create(roomDto, userBo);

        //add into new stage
        room.addUser(userBo, roomDto.getJoinTeamType());
    }

    private void joinRoom(MessageDto messageDto, String sendFrom) {
        RoomDto roomDto = ObjectUtil.readValue(messageDto.getMessage(), RoomDto.class);
        if (roomDto == null) {
            return;
        }

        //check user
        UserBo userBo = onlineUserService.get(sendFrom);
        if (userBo == null) {
            throw new CustomException("用户不存在:" + sendFrom);
        }

        //check room
        if (!roomService.roomNameExists(roomDto.getRoomId())) {
            throw new CustomException("房间不存在:" + roomDto.getRoomId());
        }

        //add into new stage
        roomService.get(roomDto.getRoomId()).addUser(userBo, roomDto.getJoinTeamType());
    }

    @Scheduled(fixedRate = 17)
    public void update() {
        roomService.update();
    }

    private BaseStage currentStage(UserBo userBo) {
        if (!StringUtils.isEmpty(userBo.getRoomId())) {
            if (!roomService.roomNameExists(userBo.getRoomId())) {
                log.warn("can not find room:{} from user:{}", userBo.getRoomId(), userBo.getUserId());
            }
            return roomService.get(userBo.getRoomId());
        } else {
            return null;
        }
    }

    private UserBo userCheckAndGetSendFrom(MessageDto messageDto, String sendFrom) {
        //检查接收方
        List<String> sendToList = messageDto.getSendToList();
        if (sendToList != null) {
            for (int i = 0; i < sendToList.size(); ++i) {
                if (!onlineUserService.exists(sendToList.get(i))) {
                    sendToList.remove(i);
                    --i;
                }
            }

            //所有接收方都不符合规范，不发送
            if (sendToList.isEmpty()) {
                return null;
            }
        }

        //检查发送方
        return onlineUserService.get(sendFrom);
    }

    private void processNewUserReady(MessageDto messageDto, String sendFrom) {
        UserDto userDto = ObjectUtil.readValue(messageDto.getMessage(), UserDto.class);
        userDto.setUserId(sendFrom);
        if (onlineUserService.processNewUserReady(userDto)) {
            sendUserStatusAndMessage(sendFrom, false);
        }
    }

    private void sendUserStatusAndMessage(String username, boolean isLeave) {
        //没人了，不用更新状态
        if (onlineUserService.getUserList().isEmpty()) {
            log.info("no user in service, no need to send message");
            return;
        }

        if (isLeave) {
            messageService.sendMessage(new MessageDto(String.format("%s 离开了! 当前总人数: %d",
                                                                    username,
                                                                    onlineUserService.getUserList().size()),
                                                      MessageType.SYSTEM_MESSAGE));
        } else {
            messageService.sendMessage(new MessageDto(String.format("%s 加入了! 当前总人数: %d",
                                                                    username,
                                                                    onlineUserService.getUserList().size()),
                                                      MessageType.SYSTEM_MESSAGE));
        }
    }
}
