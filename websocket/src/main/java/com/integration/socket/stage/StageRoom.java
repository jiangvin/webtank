package com.integration.socket.stage;

import com.integration.socket.model.ActionType;
import com.integration.socket.model.MessageType;
import com.integration.socket.model.OrientationType;
import com.integration.socket.model.RoomType;
import com.integration.socket.model.TeamType;
import com.integration.socket.model.bo.AmmoBo;
import com.integration.socket.model.bo.TankBo;
import com.integration.socket.model.bo.TankTypeBo;
import com.integration.socket.model.bo.UserBo;
import com.integration.socket.model.dto.MessageDto;
import com.integration.socket.model.dto.RoomDto;
import com.integration.socket.model.dto.ItemDto;
import com.integration.socket.service.MessageService;
import com.integration.util.object.ObjectUtil;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/4
 */

@Slf4j
public class StageRoom extends BaseStage {

    public StageRoom(RoomDto roomDto, MessageService messageService) {
        super(messageService);
        this.roomId = roomDto.getRoomId();
        this.creator = roomDto.getCreator();
        this.mapId = roomDto.getMapId();
        this.roomType = roomDto.getRoomType();
    }

    private ConcurrentHashMap<String, UserBo> userMap = new ConcurrentHashMap<>();

    @Getter
    private String roomId;

    @Getter
    private String creator;

    @Getter
    private String mapId;

    @Getter
    private RoomType roomType;

    public int getUserCount() {
        return userMap.size();
    }

    @Override
    public List<String> getUserList() {
        List<String> users = new ArrayList<>();
        for (Map.Entry<String, UserBo> kv : userMap.entrySet()) {
            users.add(kv.getKey());
        }
        return users;
    }

    @Override
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

        //同步消息
        sendRoomMessage(Collections.singletonList(ItemDto.convert(ammo)), MessageType.AMMO);
    }

    @Override
    public void update() {
        for (Map.Entry<String, TankBo> kv : tankMap.entrySet()) {
            TankBo tankBo = kv.getValue();
            if (tankBo.getActionType() == ActionType.RUN) {
                double tankSpeed = tankBo.getType().getSpeed();
                switch (tankBo.getOrientationType()) {
                    case UP:
                        tankBo.setY(tankBo.getY() - tankSpeed);
                        break;
                    case DOWN:
                        tankBo.setY(tankBo.getY() + tankSpeed);
                        break;
                    case LEFT:
                        tankBo.setX(tankBo.getX() - tankSpeed);
                        break;
                    case RIGHT:
                        tankBo.setX(tankBo.getX() + tankSpeed);
                        break;
                    default:
                        break;
                }
            }

            for (int i = 0; i < tankBo.getAmmoList().size(); ++i) {
                AmmoBo ammo = tankBo.getAmmoList().get(i);
                if (ammo.getLifeTime() == 0) {
                    tankBo.getAmmoList().remove(i);
                    --i;

                    sendRoomMessage(ammo.getId(), MessageType.REMOVE_AMMO);
                    return;
                }
                ammo.setLifeTime(ammo.getLifeTime() - 1);

                double ammoSpeed = tankBo.getType().getAmmoSpeed();
                switch (ammo.getOrientationType()) {
                    case UP:
                        ammo.setY(ammo.getY() - ammoSpeed);
                        break;
                    case DOWN:
                        ammo.setY(ammo.getY() + ammoSpeed);
                        break;
                    case LEFT:
                        ammo.setX(ammo.getX() - ammoSpeed);
                        break;
                    case RIGHT:
                        ammo.setX(ammo.getX() + ammoSpeed);
                        break;
                    default:
                        break;
                }
            }
        }
    }

    @Override
    public void remove(String username) {
        if (!userMap.containsKey(username)) {
            return;
        }

        userMap.remove(username);

        if (tankMap.containsKey(username)) {
            tankMap.remove(username);
            sendRoomMessage(username, MessageType.REMOVE_TANK);
        }
        if (getUserCount() == 0) {
            return;
        }
        sendStatusAndMessage(username, true);
    }

    private void sendStatusAndMessage(String username, boolean leave) {
        sendRoomMessage(getUserList(), MessageType.USERS);
        String message;
        if (leave) {
            message = String.format("%s 离开了房间 %s,当前房间人数: %d", username, roomId, getUserCount());
        } else {
            message = String.format("%s 加入了房间 %s,当前房间人数: %d", username, roomId, getUserCount());
        }
        messageService.sendMessage(new MessageDto(message, MessageType.SYSTEM_MESSAGE));
    }

    public void add(UserBo userBo, TeamType teamType) {
        userMap.put(userBo.getUsername(), userBo);
        userBo.setRoomId(this.roomId);
        userBo.setTeamType(teamType);

        sendStatusAndMessage(userBo.getUsername(), false);
        addNewTank(userBo.getUsername());

        //通知前端数据传输完毕
        messageService.sendReady(userBo.getUsername());
    }

    private void addNewTank(String username) {
        TankBo tankBo = new TankBo();
        tankBo.setTankId(username);
        tankBo.setType(TankTypeBo.getTankType("tank01"));
        tankBo.setX(100.0);
        tankBo.setY(100.0);

        tankMap.put(tankBo.getTankId(), tankBo);

        //即将向所有人同步信息
        sendRoomMessage(getTankList(), MessageType.TANKS);
    }

    private List<ItemDto> getTankList() {
        List<ItemDto> tankDtoList = new ArrayList<>();
        for (Map.Entry<String, TankBo> kv : tankMap.entrySet()) {
            tankDtoList.add(ItemDto.convert(kv.getValue()));
        }
        return tankDtoList;
    }

    private void processTankControl(MessageDto messageDto, String sendFrom) {
        ItemDto request = ObjectUtil.readValue(messageDto.getMessage(), ItemDto.class);
        if (request == null) {
            return;
        }
        request.setId(sendFrom);

        TankBo updateBo = updateTankControl(request);
        if (updateBo == null) {
            log.warn("can not update tank:{}, ignore it...", sendFrom);
            return;
        }

        ItemDto response = ItemDto.convert(updateBo);
        sendRoomMessage(Collections.singletonList(response), MessageType.TANKS);
    }

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
        return tankBo;
    }
}
