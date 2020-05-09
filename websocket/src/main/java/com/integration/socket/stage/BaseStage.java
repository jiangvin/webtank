package com.integration.socket.stage;

import com.integration.socket.model.MessageType;
import com.integration.socket.model.bo.AmmoBo;
import com.integration.socket.model.bo.TankBo;
import com.integration.socket.model.dto.MessageDto;
import com.integration.socket.service.MessageService;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/3
 */
public abstract class BaseStage {

    MessageService messageService;

    ConcurrentHashMap<String, TankBo> tankMap = new ConcurrentHashMap<>();

    BaseStage(MessageService messageService) {
        this.messageService = messageService;
    }

    /**
     * 处理消息入口
     * @param messageDto
     * @param sendFrom
     */
    public abstract void processMessage(MessageDto messageDto, String sendFrom);

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
     * 给房间所有用户发送消息
     */
    void sendRoomMessage(Object object, MessageType messageType) {
        messageService.sendMessage(new MessageDto(object, messageType, getUserList()));
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
        for (AmmoBo ammo : tank.getAmmoList()) {
            sendRoomMessage(ammo.getId(), MessageType.REMOVE_AMMO);
        }
        tankMap.remove(tank.getTankId());
        sendRoomMessage(tank.getTankId(), MessageType.REMOVE_TANK);
    }
}
