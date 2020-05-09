package com.integration.socket.stage;

import com.integration.socket.model.ActionType;
import com.integration.socket.model.MessageType;
import com.integration.socket.model.OrientationType;
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
 * @description 菜单
 * @date 2020/5/3
 */

@Slf4j
public class StageMenu extends BaseStage {

    private static final String MENU_DEFAULT_TYPE = "tankMenu";

    private ConcurrentHashMap<String, TankBo> tankMap = new ConcurrentHashMap<>();

    public StageMenu(MessageService messageService) {
        super(messageService);
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

            //更新子弹设定
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
        if (!removeTank(username) || getUserList().isEmpty()) {
            return;
        }
        messageService.sendMessage(new MessageDto(getUserList(), MessageType.USERS, getUserList()));
        messageService.sendMessage(new MessageDto(username, MessageType.REMOVE_TANK));
    }

    @Override
    public List<String> getUserList() {
        List<String> users = new ArrayList<>();
        for (Map.Entry<String, TankBo> kv : tankMap.entrySet()) {
            users.add(kv.getKey());
        }
        return users;
    }

    public void addTank(MessageDto messageDto, String sendFrom) {
        ItemDto tankDto = ObjectUtil.readValue(messageDto.getMessage(), ItemDto.class);
        if (tankDto == null) {
            return;
        }
        tankDto.setId(sendFrom);
        tankDto.setTypeId(MENU_DEFAULT_TYPE);

        if (tankMap.containsKey(tankDto.getId())) {
            //单独发送同步消息
            messageService.sendMessage(new MessageDto(getUserList(), MessageType.USERS, sendFrom));
            messageService.sendMessage(new MessageDto(getTankList(), MessageType.TANKS, sendFrom));
            return;
        }

        TankBo tankBo = TankBo.convert(tankDto);
        tankMap.put(tankBo.getTankId(), tankBo);

        //收到单位，即将向所有人同步单位信息
        messageService.sendMessage(new MessageDto(getUserList(), MessageType.USERS, getUserList()));
        MessageDto sendBack = new MessageDto(getTankList(), MessageType.TANKS, getUserList());
        messageService.sendMessage(sendBack);

        messageService.sendReady(sendFrom);
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
        MessageDto sendBack = new MessageDto(Collections.singletonList(response), MessageType.TANKS, getUserList());
        messageService.sendMessage(sendBack);
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

    private boolean removeTank(String tankId) {
        if (!tankMap.containsKey(tankId)) {
            return false;
        }
        tankMap.remove(tankId);
        return true;
    }
}
