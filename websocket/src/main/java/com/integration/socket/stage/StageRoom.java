package com.integration.socket.stage;

import com.integration.socket.model.ActionType;
import com.integration.socket.model.MessageType;
import com.integration.socket.model.RoomType;
import com.integration.socket.model.TeamType;
import com.integration.socket.model.bo.MapBo;
import com.integration.socket.model.bo.TankBo;
import com.integration.socket.model.bo.TankTypeBo;
import com.integration.socket.model.bo.UserBo;
import com.integration.socket.model.dto.ItemDto;
import com.integration.socket.model.dto.MapDto;
import com.integration.socket.model.dto.RoomDto;
import com.integration.socket.service.MessageService;
import com.integration.socket.util.CommonUtil;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.awt.Point;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/4
 */

@Slf4j
public class StageRoom extends BaseStage {

    public StageRoom(RoomDto roomDto, MapBo mapBo, MessageService messageService) {
        super(messageService);
        this.roomId = roomDto.getRoomId();
        this.creator = roomDto.getCreator();
        this.mapId = roomDto.getMapId();
        this.roomType = roomDto.getRoomType();
        this.mapBo = mapBo;
    }

    private ConcurrentHashMap<String, UserBo> userMap = new ConcurrentHashMap<>();

    private MapBo mapBo;

    @Getter
    private String roomId;

    @Getter
    private String creator;

    @Getter
    private String mapId;

    @Getter
    private RoomType roomType;

    private Random random = new Random();

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
        }
    }

    @Override
    public void remove(String username) {
        if (!userMap.containsKey(username)) {
            return;
        }

        userMap.remove(username);
        removeTankFromUserId(username);
        if (getUserCount() == 0) {
            return;
        }
        sendStatusAndMessage(username, true);
    }

    private void sendStatusAndMessage(String username, boolean leave) {
        sendMessageToRoom(getUserList(), MessageType.USERS);
        String message;
        if (leave) {
            message = String.format("%s 离开了房间 %s,当前房间人数: %d", username, roomId, getUserCount());
        } else {
            message = String.format("%s 加入了房间 %s,当前房间人数: %d", username, roomId, getUserCount());
        }
        sendMessageToRoom(message, MessageType.SYSTEM_MESSAGE);
    }

    public void add(UserBo userBo, TeamType teamType) {
        userMap.put(userBo.getUsername(), userBo);
        userBo.setRoomId(this.roomId);
        userBo.setTeamType(teamType);
        sendStatusAndMessage(userBo.getUsername(), false);

        //发送场景信息
        sendMessageToUser(MapDto.convert(mapBo), MessageType.MAP, userBo.getUsername());

        addNewTank(userBo);

        //通知前端数据传输完毕
        sendReady(userBo.getUsername());
    }

    private void addNewTank(UserBo userBo) {
        if (userBo.getTeamType() == TeamType.VIEW) {
            return;
        }

        TankBo tankBo = new TankBo();
        tankBo.setTankId(userBo.getUsername());
        tankBo.setUserId(userBo.getUsername());
        tankBo.setTeamType(userBo.getTeamType());
        tankBo.setType(TankTypeBo.getTankType("tank01"));

        Point startPoint = getTankPoint(tankBo.getTeamType());
        tankBo.setX(startPoint.getX());
        tankBo.setY(startPoint.getY());

        tankMap.put(tankBo.getTankId(), tankBo);

        //即将向所有人同步信息
        sendMessageToRoom(getTankList(), MessageType.TANKS);
    }

    private List<ItemDto> getTankList() {
        List<ItemDto> tankDtoList = new ArrayList<>();
        for (Map.Entry<String, TankBo> kv : tankMap.entrySet()) {
            tankDtoList.add(ItemDto.convert(kv.getValue()));
        }
        return tankDtoList;
    }

    private Point getTankPoint(TeamType teamType) {
        String posStr;
        if (teamType == TeamType.RED) {
            posStr = mapBo.getPlayerStartPoints().get(random.nextInt(
                                                          mapBo.getPlayerStartPoints().size()));
        } else {
            posStr = mapBo.getComputerStartPoints().get(random.nextInt(
                                                            mapBo.getComputerStartPoints().size()));
        }
        return CommonUtil.getPointFromKey(posStr);
    }
}
