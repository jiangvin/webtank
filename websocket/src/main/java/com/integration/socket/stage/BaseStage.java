package com.integration.socket.stage;

import com.integration.socket.model.MessageType;
import com.integration.socket.model.bo.AmmoBo;
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

    ConcurrentHashMap<String, AmmoBo> ammoMap = new ConcurrentHashMap<>();

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
        AmmoBo ammo = tankBo.fire();
        if (ammo == null) {
            return;
        }
        ammoMap.put(ammo.getId(), ammo);
        processTankFireExtension(ammo);
        sendMessageToRoom(Collections.singletonList(ItemDto.convert(ammo)), MessageType.AMMO);
    }

    /**
     * 拓展函数
     * @param ammo
     */
    void processTankFireExtension(AmmoBo ammo) {

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

        ItemDto response = ItemDto.convert(updateBo);
        sendMessageToRoom(Collections.singletonList(response), MessageType.TANKS);
    }

    /**
     * 更新控制，房间内的更新只更新网格
     * @param tankDto
     * @return
     */
    abstract TankBo updateTankControl(ItemDto tankDto);

    /**
     * 每一帧的更新数据 （17ms 一帧，模拟1秒60帧刷新模式）
     */
    public abstract void update();


    /**
     * 用户离开时触发
     * @param username 离开的用户名
     */
    public abstract void remove(String username);

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

    void sendTankToRoom(TankBo tankBo) {
        sendMessageToRoom(Collections.singletonList(ItemDto.convert(tankBo)), MessageType.TANKS);
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
