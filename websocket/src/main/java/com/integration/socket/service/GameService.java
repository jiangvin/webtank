package com.integration.socket.service;

import com.integration.dto.bot.BotType;
import com.integration.dto.message.MessageDto;
import com.integration.dto.message.MessageType;
import com.integration.dto.room.RoomDto;
import com.integration.dto.room.RoomType;
import com.integration.dto.room.TeamType;
import com.integration.socket.model.bo.UserBo;
import com.integration.socket.model.bot.BaseBotBo;
import com.integration.socket.model.stage.BaseStage;
import com.integration.socket.model.stage.StageRoom;
import com.integration.socket.repository.jooq.tables.records.UserRecord;
import com.integration.util.CommonUtil;
import com.integration.util.model.CustomException;
import com.integration.util.object.ObjectUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

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

    @Autowired
    private RoomService roomService;

    public void removeUser(String userId) {
        UserBo userBo = onlineUserService.remove(userId);
        if (userBo == null) {
            return;
        }

        StageRoom stage = currentStage(userBo);
        if (stage == null) {
            return;
        }
        stage.removeUser(userId);

        //房间为空时删除房间
        if (stage.getUserCount() != 0) {
            return;
        }

        log.info("room:{} will be removed", stage.getRoomId());
        roomService.remove(stage);
    }

    public void receiveMessage(MessageDto messageDto, String sendFrom) {
        //新用户加入时处理，不需要检查用户是否存在
        if (messageDto.getMessageType() == MessageType.CLIENT_READY) {
            onlineUserService.processNewUserReady(sendFrom);
            return;
        }

        UserBo userBo = userCheckAndGetSendFrom(messageDto, sendFrom);
        if (userBo == null) {
            return;
        }

        log.debug("receive:{} from user:{}", CommonUtil.ignoreNull(messageDto.toString()), sendFrom);
        switch (messageDto.getMessageType()) {
            case PING:
                userBo.sendMessage(messageDto);
                break;
            case CREATE_ROOM:
                createRoom(messageDto, sendFrom);
                break;
            case JOIN_ROOM:
                joinRoom(messageDto, sendFrom);
                break;
            default:
                BaseStage stage = currentStage(userBo);
                if (stage != null) {
                    stage.processMessage(messageDto, sendFrom);
                }
                break;
        }
    }

    /**
     * 续关
     * @param userId
     */
    UserRecord restartStage(String userId) {
        UserBo userBo = onlineUserService.getFormUserId(userId);
        if (userBo == null) {
            throw new CustomException("用户不存在");
        }
        StageRoom stage = currentStage(userBo);
        if (stage == null) {
            throw new CustomException("房间不存在");
        }

        stage.restartPve(userBo);
        return userBo.getUserRecord();
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
        userBo.setTeamType(roomDto.getJoinTeamType());

        //add into new stage
        room.addUser(userBo);

        addBot(room, roomDto.getRoomType());
    }

    private void addBot(StageRoom room, RoomType roomType) {
        if (roomType != RoomType.PVE) {
            return;
        }

        BaseBotBo bot = BaseBotBo.getInstance(BotType.SIMPLE);
        bot.setTeamType(TeamType.BLUE);
        room.addBot(bot);
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
        if (!roomService.roomIdExists(roomDto.getRoomId())) {
            throw new CustomException("房间不存在:" + roomDto.getRoomId());
        }
        userBo.setTeamType(roomDto.getJoinTeamType());

        //add into new stage
        roomService.get(roomDto.getRoomId()).addUser(userBo);
    }

    private StageRoom currentStage(UserBo userBo) {
        if (StringUtils.isEmpty(userBo.getRoomId()) || !roomService.roomIdExists(userBo.getRoomId())) {
            log.warn("can not find room:{} from user:{}", userBo.getRoomId(), userBo.getUsername());
            return null;
        }
        return roomService.get(userBo.getRoomId());
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
}
