package com.integration.socket.stage;

import com.integration.socket.model.ActionType;
import com.integration.socket.model.MapUnitType;
import com.integration.socket.model.MessageType;
import com.integration.socket.model.OrientationType;
import com.integration.socket.model.RoomType;
import com.integration.socket.model.TeamType;
import com.integration.socket.model.bo.AmmoBo;
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
import java.util.Collections;
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

    private ConcurrentHashMap<String, List<String>> gridTankMap = new ConcurrentHashMap<>();

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
        //更新坦克
        for (Map.Entry<String, TankBo> kv : tankMap.entrySet()) {
            TankBo tankBo = kv.getValue();
            updateTank(tankBo);
        }

        //更新子弹
        for (int i = 0; i < ammoBoList.size(); ++i) {
            AmmoBo ammo = ammoBoList.get(i);
            if (ammo.getLifeTime() == 0) {
                ammoBoList.remove(i);
                --i;

                if (tankMap.containsKey(ammo.getTankId())) {
                    tankMap.get(ammo.getTankId()).addAmmoCount();
                }

                sendMessageToRoom(ItemDto.convert(ammo), MessageType.REMOVE_AMMO);
                continue;
            }
            ammo.setLifeTime(ammo.getLifeTime() - 1);

            switch (ammo.getOrientationType()) {
                case UP:
                    ammo.setY(ammo.getY() - ammo.getSpeed());
                    break;
                case DOWN:
                    ammo.setY(ammo.getY() + ammo.getSpeed());
                    break;
                case LEFT:
                    ammo.setX(ammo.getX() - ammo.getSpeed());
                    break;
                case RIGHT:
                    ammo.setX(ammo.getX() + ammo.getSpeed());
                    break;
                default:
                    break;
            }
        }
    }

    private void updateTank(TankBo tankBo) {
        if (tankBo.getActionType() == ActionType.STOP && !tankBo.hasDifferentCache()) {
            return;
        }

        if (tankBo.getActionType() == ActionType.STOP) {
            updateInCache(tankBo);
            return;
        }

        boolean needUpdateInCache = false;
        double speed = tankBo.getType().getSpeed();
        double distance = tankBo.distanceToEndGrid();
        if (distance <= speed) {
            speed = distance;
            needUpdateInCache = true;
        }
        tankBo.run(speed);

        if (needUpdateInCache) {
            String startKey = tankBo.getStartGridKey();
            removeToGridTankMap(tankBo, startKey);
            tankBo.setStartGridKey(tankBo.getEndGridKey());
            updateInCache(tankBo);
        }
    }

    private void updateInCache(TankBo tankBo) {
        int gridX = (int)(tankBo.getX() / CommonUtil.UNIT_SIZE);
        int gridY = (int)(tankBo.getY() / CommonUtil.UNIT_SIZE);
        if (tankBo.getActionCache() == ActionType.RUN) {
            switch (tankBo.getOrientationCache()) {
                case UP:
                    --gridY;
                    break;
                case DOWN:
                    ++gridY;
                    break;
                case LEFT:
                    --gridX;
                    break;
                case RIGHT:
                    ++gridX;
                    break;
                default:
                    break;
            }

            if (!canRun(gridX, gridY, tankBo)) {
                tankBo.setActionCache(ActionType.STOP);
                updateInCache(tankBo);
            }
        }

        //更新缓存
        boolean needSendMessage = tankBo.hasDifferentCache();
        tankBo.setActionType(tankBo.getActionCache());
        tankBo.setOrientationType(tankBo.getOrientationCache());
        if (tankBo.getActionType() == ActionType.RUN) {
            //开始跑，更新目标
            String endKey = CommonUtil.generateKey(gridX, gridY);
            tankBo.setEndGridKey(endKey);
            insertToGridTankMap(tankBo, endKey);
        }
        if (needSendMessage) {
            sendMessageToRoom(Collections.singletonList(ItemDto.convert(tankBo)), MessageType.TANKS);
        }
    }

    private boolean canRun(int gridX, int gridY, TankBo tankBo) {
        if (gridX < 0 || gridY < 0 || gridX >= mapBo.getMaxGridX() || gridY >= mapBo.getMaxGridY()) {
            //超出范围，停止
            return false;
        } else {
            String goalKey = CommonUtil.generateKey(gridX, gridY);
            if (!canPass(mapBo.getUnitMap().get(goalKey))) {
                //有障碍物，停止
                return false;
            } else if (gridTankMap.containsKey(goalKey)) {
                for (String tankId : gridTankMap.get(goalKey)) {
                    //跳过自己
                    if (tankId.equals(tankBo.getTankId())) {
                        continue;
                    }

                    TankBo target = tankMap.get(tankId);
                    if (collide(tankBo, target)) {
                        //和其他坦克相撞，停止
                        return false;
                    }
                }
            }
        }
        return true;
    }

    private boolean collide(TankBo tank1, TankBo tank2) {
        switch (tank1.getOrientationCache()) {
            case UP:
                if (CommonUtil.betweenAnd(tank1.getY() - tank2.getY(), 0, CommonUtil.UNIT_SIZE)) {
                    return true;
                }
                break;
            case DOWN:
                if (CommonUtil.betweenAnd(tank2.getY() - tank1.getY(), 0, CommonUtil.UNIT_SIZE)) {
                    return true;
                }
                break;
            case LEFT:
                if (CommonUtil.betweenAnd(tank1.getX() - tank2.getX(), 0, CommonUtil.UNIT_SIZE)) {
                    return true;
                }
                break;
            case RIGHT:
                if (CommonUtil.betweenAnd(tank2.getX() - tank1.getX(), 0, CommonUtil.UNIT_SIZE)) {
                    return true;
                }
                break;
            default:
                break;
        }
        return false;
    }

    private boolean canPass(MapUnitType mapUnitType) {
        if (mapUnitType == null) {
            return true;
        }
        return mapUnitType == MapUnitType.GRASS;
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
        tankBo.setAmmoCount(tankBo.getType().getAmmoMaxCount());
        setStartPoint(tankBo);
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

    private void setStartPoint(TankBo tankBo) {
        String posStr;
        if (tankBo.getTeamType() == TeamType.RED) {
            posStr = mapBo.getPlayerStartPoints().get(random.nextInt(mapBo.getPlayerStartPoints().size()));
        } else {
            posStr = mapBo.getComputerStartPoints().get(random.nextInt(mapBo.getComputerStartPoints().size()));
        }
        tankBo.setStartGridKey(posStr);
        Point point = CommonUtil.getPointFromKey(posStr);
        tankBo.setX(point.getX());
        tankBo.setY(point.getY());
        insertToGridTankMap(tankBo, tankBo.getStartGridKey());
    }

    private void insertToGridTankMap(TankBo tankBo, String key) {
        if (!gridTankMap.containsKey(key)) {
            gridTankMap.put(key, new ArrayList<>());
        }
        gridTankMap.get(key).add(tankBo.getTankId());
    }

    private void removeToGridTankMap(TankBo tankBo, String key) {
        if (!gridTankMap.containsKey(key)) {
            return;
        }
        gridTankMap.get(key).remove(tankBo.getTankId());
        if (gridTankMap.get(key).isEmpty()) {
            gridTankMap.remove(key);
        }
    }

    @Override
    TankBo updateTankControl(ItemDto tankDto) {
        if (!tankMap.containsKey(tankDto.getId())) {
            return null;
        }


        TankBo tankBo = tankMap.get(tankDto.getId());

        //只更新缓存状态
        OrientationType orientationType = OrientationType.convert(tankDto.getOrientation());
        if (orientationType != OrientationType.UNKNOWN) {
            tankBo.setOrientationCache(orientationType);
        }
        ActionType actionType = ActionType.convert(tankDto.getAction());
        if (actionType != ActionType.UNKNOWN) {
            tankBo.setActionCache(actionType);
        }

        //返回空，不需要及时同步给客户端
        return null;
    }
}
