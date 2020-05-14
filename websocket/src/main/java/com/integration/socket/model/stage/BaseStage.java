package com.integration.socket.model.stage;

import com.integration.socket.model.ActionType;
import com.integration.socket.model.MessageType;
import com.integration.socket.model.OrientationType;
import com.integration.socket.model.bo.BulletBo;
import com.integration.socket.model.bo.TankBo;
import com.integration.socket.model.dto.ItemDto;
import com.integration.socket.model.dto.MessageDto;
import com.integration.socket.service.MessageService;
import com.integration.util.object.ObjectUtil;
import lombok.extern.slf4j.Slf4j;

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

    private MessageService messageService;

    ConcurrentHashMap<String, TankBo> tankMap = new ConcurrentHashMap<>();

    ConcurrentHashMap<String, BulletBo> bulletMap = new ConcurrentHashMap<>();

    BaseStage(MessageService messageService) {
        this.messageService = messageService;
    }

    /**
     * 处理消息入口
     * @param messageDto
     * @param sendFrom
     */
    public void processMessage(MessageDto messageDto, String sendFrom) {
        switch (messageDto.getMessageType()) {
            case UPDATE_TANK_CONTROL:
                processTankControl(messageDto, sendFrom);
                break;
            case UPDATE_TANK_FIRE:
                processTankFire(sendFrom);
                break;
            default:
                break;
        }
    }

    private void processTankFire(String sendFrom) {
        if (!tankMap.containsKey(sendFrom)) {
            return;
        }

        TankBo tankBo = tankMap.get(sendFrom);
        BulletBo ammo = tankBo.fire();
        if (ammo == null) {
            return;
        }
        bulletMap.put(ammo.getId(), ammo);
        processTankFireExtension(ammo);
        sendMessageToRoom(Collections.singletonList(ItemDto.convert(ammo)), MessageType.BULLET);
    }

    /**
     * 拓展函数
     * @param ammo
     */
    void processTankFireExtension(BulletBo ammo) {

    }

    private void processTankControl(MessageDto messageDto, String sendFrom) {
        ItemDto request = ObjectUtil.readValue(messageDto.getMessage(), ItemDto.class);
        if (request == null) {
            return;
        }
        request.setId(sendFrom);

        TankBo updateBo = updateTankControl(request);
        if (updateBo == null) {
            return;
        }

        sendTankToRoom(updateBo);
    }

    /**
     * 更新控制，房间内的更新只更新网格
     * @param tankDto
     * @return
     */
    private TankBo updateTankControl(ItemDto tankDto) {
        if (!tankMap.containsKey(tankDto.getId())) {
            return null;
        }

        TankBo tankBo = tankMap.get(tankDto.getId());
        //状态只同步朝向和移动命令
        OrientationType orientationType = OrientationType.convert(tankDto.getOrientation());
        if (orientationType != OrientationType.UNKNOWN) {
            tankBo.setOrientationType(orientationType);
        }
        ActionType actionType = ActionType.convert(tankDto.getAction());
        if (actionType != ActionType.UNKNOWN) {
            tankBo.setActionType(actionType);
        }
        updateTankControlExtension(tankBo, tankDto);
        return tankBo;
    }

    /**
     * 继承扩展函数
     * @param tankBo
     * @param tankDto
     */
    void updateTankControlExtension(TankBo tankBo, ItemDto tankDto) {

    }

    /**
     * 每一帧的更新数据 （17ms 一帧，模拟1秒60帧刷新模式）
     */
    public abstract void update();


    /**
     * 用户离开时触发
     * @param username 离开的用户名
     */
    public abstract void removeUser(String username);

    /**
     * 获取用户列表
     * @return 用户列表
     */
    abstract List<String> getUserList();

    /**
     * 获取房间号
     * @return 房间号
     */
    public abstract String getRoomId();

    /**
     * 给房间所有用户发送消息
     */
    void sendMessageToRoom(Object object, MessageType messageType) {
        messageService.sendMessage(new MessageDto(object, messageType, getUserList(), getRoomId()));
    }

    void sendMessageToRoom(Object object, MessageType messageType, String note) {
        messageService.sendMessage(new MessageDto(object, messageType, getUserList(), getRoomId(), note));
    }

    void sendTankToRoom(TankBo tankBo) {
        sendTankToRoom(tankBo, null);
    }

    void sendTankToRoom(TankBo tankBo, String note) {
        tankBo.refreshSyncTime();
        sendMessageToRoom(Collections.singletonList(ItemDto.convert(tankBo)), MessageType.TANKS, note);
    }

    void sendMessageToUser(Object object, MessageType messageType, String username) {
        messageService.sendMessage(new MessageDto(object, messageType, username, getRoomId()));
    }

    void sendReady(String username) {
        messageService.sendReady(username, getRoomId());
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
        sendMessageToRoom(ItemDto.convert(tank), MessageType.REMOVE_TANK);
    }

    /**
     * 删除tank的扩展函数
     * @param tankBo
     */
    void removeTankExtension(TankBo tankBo) {

    }
}
