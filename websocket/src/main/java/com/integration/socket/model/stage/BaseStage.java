package com.integration.socket.model.stage;

import com.integration.dto.map.ActionType;
import com.integration.dto.map.ItemDto;
import com.integration.dto.map.OrientationType;
import com.integration.dto.message.MessageDto;
import com.integration.dto.message.MessageType;
import com.integration.dto.room.GameStatusDto;
import com.integration.dto.room.GameStatusType;
import com.integration.dto.room.TeamType;
import com.integration.socket.model.bo.BulletBo;
import com.integration.socket.model.bo.TankBo;
import com.integration.socket.model.bo.UserBo;
import com.integration.socket.model.dto.FaceDto;
import com.integration.socket.service.MessageService;
import com.integration.util.object.ObjectUtil;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.awt.Point;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/3
 */

@Slf4j
public abstract class BaseStage {

    private static int UPDATE_DISTANCE_LIMIT = 30;

    private MessageService messageService;

    ConcurrentHashMap<String, UserBo> userMap = new ConcurrentHashMap<>();

    @Getter
    ConcurrentHashMap<String, TankBo> tankMap = new ConcurrentHashMap<>();

    ConcurrentHashMap<String, BulletBo> bulletMap = new ConcurrentHashMap<>();

    /**
     * 游戏状态相关
     */
    @Getter
    GameStatusDto gameStatus = new GameStatusDto();

    BaseStage(MessageService messageService) {
        this.messageService = messageService;
    }

    public int getUserCount() {
        return userMap.size();
    }

    /**
     * 处理消息入口
     *
     * @param messageDto
     * @param sendFrom
     */
    public void processMessage(MessageDto messageDto, String sendFrom) {
        switch (messageDto.getMessageType()) {
            case UPDATE_TANK_CONTROL:
                processTankControl(messageDto, sendFrom);
                break;
            case UPDATE_TANK_FIRE:
                processTankFire((String) messageDto.getMessage(), sendFrom);
                break;
            case USER_MESSAGE:
                sendMessageToRoom(String.format("%s: %s", sendFrom, messageDto.getMessage()), messageDto.getMessageType());
                break;
            case FACE:
                sendFace((String) messageDto.getMessage(), sendFrom);
                break;
            default:
                break;
        }
    }

    private void sendFace(String faceId, String username) {
        if (!tankMap.containsKey(username)) {
            return;
        }
        sendMessageToRoom(new FaceDto(username, faceId), MessageType.FACE);
    }

    public void processTankFire(String tankId, String sendFrom) {
        if (tankId == null) {
            tankId = sendFrom;
        }

        if (!tankMap.containsKey(tankId)) {
            return;
        }

        TankBo tankBo = tankMap.get(tankId);
        if (!tankBo.getUserId().equals(sendFrom)) {
            return;
        }

        if (gameStatus.getType() == GameStatusType.PAUSE_BLUE && tankBo.getTeamType() == TeamType.BLUE) {
            return;
        }

        if (gameStatus.getType() == GameStatusType.PAUSE_RED && tankBo.getTeamType() == TeamType.RED) {
            return;
        }

        BulletBo ammo = tankBo.fire();
        if (ammo == null) {
            return;
        }
        bulletMap.put(ammo.getId(), ammo);
        sendMessageToRoom(Collections.singletonList(ammo.convertToDto()), MessageType.BULLET);
    }

    private void processTankControl(MessageDto messageDto, String sendFrom) {
        ItemDto request = ObjectUtil.readValue(messageDto.getMessage(), ItemDto.class);
        if (request == null) {
            return;
        }
        if (request.getId() == null) {
            request.setId(sendFrom);
        }

        TankBo updateBo = updateTankControl(request, sendFrom);
        if (updateBo == null) {
            return;
        }

        String note = null;
        if (!updateTankPos(updateBo, request)) {
            note = "UPDATE_POS_FAILED";
        }

        sendTankToRoom(updateBo, note);
    }

    /**
     * 距离检测，防止闪烁
     *
     * @param tankBo
     * @param tankDto
     * @return
     */
    private boolean updateTankPos(TankBo tankBo, ItemDto tankDto) {
        if (tankDto.getX() == null || tankDto.getY() == null) {
            return false;
        }

        double distance = Point.distance(tankBo.getX(), tankBo.getY(), tankDto.getX(), tankDto.getY());
        if (distance > UPDATE_DISTANCE_LIMIT) {
            return false;
        }

        tankBo.setX(tankDto.getX());
        tankBo.setY(tankDto.getY());
        return true;
    }

    /**
     * 更新控制，房间内的更新只更新网格
     *
     * @param tankDto
     * @return
     */
    private TankBo updateTankControl(ItemDto tankDto, String sendFrom) {
        if (!tankMap.containsKey(tankDto.getId())) {
            return null;
        }

        TankBo tankBo = tankMap.get(tankDto.getId());
        if (!tankBo.getUserId().equals(sendFrom)) {
            return null;
        }

        //状态只同步朝向和移动命令
        OrientationType orientationType = OrientationType.convert(tankDto.getOrientation());
        if (orientationType != OrientationType.UNKNOWN) {
            tankBo.setOrientationType(orientationType);
        }
        ActionType actionType = ActionType.convert(tankDto.getAction());
        if (actionType != ActionType.UNKNOWN) {
            tankBo.setActionType(actionType);
        }
        return tankBo;
    }

    /**
     * 每一帧的更新数据 （16ms 一帧，模拟1秒60帧刷新模式）
     */
    public abstract void update();


    /**
     * 用户离开时触发
     *
     * @param username 离开的用户名
     */
    public abstract void removeUser(String username);

    /**
     * 获取用户列表
     *
     * @return 用户列表
     */
    abstract List<String> getUserList();

    /**
     * 获取房间号
     *
     * @return 房间号
     */
    public abstract String getRoomId();

    /**
     * 给房间所有用户发送消息
     */
    void sendMessageToRoom(Object object, MessageType messageType) {
        messageService.sendMessage(new MessageDto(object, messageType, getUserList(), getRoomId()));
    }

    private void sendMessageToRoom(Object object, MessageType messageType, String note) {
        messageService.sendMessage(new MessageDto(object, messageType, getUserList(), getRoomId(), note));
    }

    void sendTankToRoom(TankBo tankBo) {
        sendTankToRoom(tankBo, null);
    }

    void sendTankToRoom(TankBo tankBo, String note) {
        sendMessageToRoom(Collections.singletonList(tankBo.toDto()), MessageType.TANKS, note);
    }

    void sendMessageToUser(Object object, MessageType messageType, String username) {
        messageService.sendMessage(new MessageDto(object, messageType, username, getRoomId()));
    }

    void removeTankFromUserId(String userId) {
        List<String> removeTankIds = new ArrayList<>();
        for (Map.Entry<String, TankBo> kv : tankMap.entrySet()) {
            if (kv.getValue().getUserId().equals(userId)) {
                removeTankIds.add(kv.getKey());
            }
        }
        for (String tankId : removeTankIds) {
            removeTankFromTankId(tankId);
        }
    }

    void removeTankFromTankId(String tankId) {
        if (!tankMap.containsKey(tankId)) {
            return;
        }

        TankBo tank = tankMap.get(tankId);
        tankMap.remove(tank.getTankId());
        removeTankExtension(tank);
        sendMessageToRoom(tank.toDto(), MessageType.REMOVE_TANK);
    }

    /**
     * 删除tank的扩展函数
     * @param tankBo 要删除的目标
     */
    abstract void removeTankExtension(TankBo tankBo);
}
