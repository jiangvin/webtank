package com.integration.socket.stage;

import com.integration.socket.model.ActionType;
import com.integration.socket.model.MessageType;
import com.integration.socket.model.OrientationType;
import com.integration.socket.model.bo.TankBo;
import com.integration.socket.model.dto.MessageDto;
import com.integration.socket.model.dto.TankDto;
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
    private MessageService messageService;

    private ConcurrentHashMap<String, TankBo> tankMap = new ConcurrentHashMap<>();

    public StageMenu(MessageService messageService) {
        this.messageService = messageService;
    }

    @Override
    public void processMessage(MessageDto messageDto, String sendFrom) {
        switch (messageDto.getMessageType()) {
            case UPDATE_TANK_CONTROL:
                processTankControl(messageDto, sendFrom);
                break;
            default:
                break;
        }
    }

    @Override
    public void update() {
        for (Map.Entry<String, TankBo> kv : tankMap.entrySet()) {
            TankBo tankBo = kv.getValue();
            if (tankBo.getActionType() == ActionType.RUN) {
                switch (tankBo.getOrientationType()) {
                    case UP:
                        tankBo.setY(tankBo.getY() - tankBo.getSpeed());
                        break;
                    case DOWN:
                        tankBo.setY(tankBo.getY() + tankBo.getSpeed());
                        break;
                    case LEFT:
                        tankBo.setX(tankBo.getX() - tankBo.getSpeed());
                        break;
                    case RIGHT:
                        tankBo.setX(tankBo.getX() + tankBo.getSpeed());
                        break;
                    default:
                        break;
                }
            }
        }
    }

    @Override
    public void remove(String username) {
        if (!removeTank(username)) {
            return;
        }
        messageService.sendMessage(new MessageDto(username, MessageType.REMOVE_TANK));
    }

    public void addTank(MessageDto messageDto, String sendFrom) {
        TankDto tankDto = ObjectUtil.readValue(messageDto.getMessage(), TankDto.class);
        if (tankDto == null) {
            return;
        }
        tankDto.setId(sendFrom);

        if (tankMap.containsKey(tankDto.getId())) {
            return;
        }
        TankBo tankBo = TankBo.convert(tankDto);
        tankMap.put(tankBo.getTankId(), tankBo);

        //收到单位，即将向所有人同步单位信息
        MessageDto sendBack = new MessageDto(getTankList(), MessageType.TANKS);
        messageService.sendMessage(sendBack);
    }

    private List<TankDto> getTankList() {
        List<TankDto> tankDtoList = new ArrayList<>();
        for (Map.Entry<String, TankBo> kv : tankMap.entrySet()) {
            tankDtoList.add(TankDto.convert(kv.getValue()));
        }
        return tankDtoList;
    }

    private void processTankControl(MessageDto messageDto, String sendFrom) {
        TankDto request = ObjectUtil.readValue(messageDto.getMessage(), TankDto.class);
        if (request == null) {
            return;
        }
        request.setId(sendFrom);

        TankBo updateBo = updateTankControl(request);
        if (updateBo == null) {
            log.warn("can not update tank:{}, ignore it...", sendFrom);
            return;
        }

        TankDto response = TankDto.convert(updateBo);
        MessageDto sendBack = new MessageDto(Collections.singletonList(response), MessageType.TANKS);
        messageService.sendMessage(sendBack);
    }

    private TankBo updateTankControl(TankDto tankDto) {
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
