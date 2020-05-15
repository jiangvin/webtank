package com.integration.socket.model.stage;

import com.integration.socket.model.ActionType;
import com.integration.socket.model.CollideType;
import com.integration.socket.model.MapUnitType;
import com.integration.socket.model.MessageType;
import com.integration.socket.model.RoomType;
import com.integration.socket.model.TeamType;
import com.integration.socket.model.bo.BulletBo;
import com.integration.socket.model.bo.MapBo;
import com.integration.socket.model.bo.TankBo;
import com.integration.socket.model.bo.TankTypeBo;
import com.integration.socket.model.bo.UserBo;
import com.integration.socket.model.dto.ItemDto;
import com.integration.socket.model.dto.MapDto;
import com.integration.socket.model.dto.RoomDto;
import com.integration.socket.model.event.BaseEvent;
import com.integration.socket.model.event.CreateTankEvent;
import com.integration.socket.service.MessageService;
import com.integration.socket.util.CommonUtil;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;

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

    private static final long SYNC_BULLET_TIME = 1000;

    private static final long SYNC_TANK_TIME = 2000;

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

    private ConcurrentHashMap<String, List<String>> gridBulletMap = new ConcurrentHashMap<>();

    private List<BaseEvent> eventList = new ArrayList<>();

    /**
     * 要删除的子弹列表，每帧刷新
     */
    private List<String> removeBulletIds = new ArrayList<>();

    /**
     * 要更新的子弹列表，保证子弹每秒和客户端同步一次
     */
    private List<BulletBo> syncBulletList = new ArrayList<>();

    /**
     * 要更新的坦克列表，保证坦克每秒和客户端同步一次
     */
    private List<TankBo> syncTankList = new ArrayList<>();

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

    private boolean isPause = false;

    public int getUserCount() {
        return userMap.size();
    }

    private void addRemoveBulletIds(String id) {
        if (!this.removeBulletIds.contains(id)) {
            removeBulletIds.add(id);
        }
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
        processEvent();

        if (this.isPause) {
            return;
        }

        for (Map.Entry<String, TankBo> kv : tankMap.entrySet()) {
            TankBo tankBo = kv.getValue();
            updateTank(tankBo);
        }
        syncTanks();

        for (Map.Entry<String, BulletBo> kv : bulletMap.entrySet()) {
            updateBullet(kv.getValue());
        }
        removeBullets();
        syncBullets();
    }

    private void addSyncList(TankBo tankBo) {
        if (System.currentTimeMillis() - tankBo.getLastSyncTime() > SYNC_TANK_TIME) {
            syncTankList.add(tankBo);
        }
    }

    private void syncTanks() {
        if (syncTankList.isEmpty()) {
            return;
        }

        List<ItemDto> dtoList = new ArrayList<>();
        for (TankBo tank : syncTankList) {
            dtoList.add(ItemDto.convert(tank));
            tank.refreshSyncTime();
        }
        sendMessageToRoom(dtoList, MessageType.TANKS);
        syncTankList.clear();
    }

    private void syncBullets() {
        if (syncBulletList.isEmpty()) {
            return;
        }

        List<ItemDto> dtoList = new ArrayList<>();
        for (BulletBo bullet : syncBulletList) {
            dtoList.add(ItemDto.convert(bullet));
            bullet.refreshSyncTime();
        }
        sendMessageToRoom(dtoList, MessageType.BULLET);
        syncBulletList.clear();
    }

    private void processEvent() {
        if (eventList.isEmpty()) {
            return;
        }

        for (int i = 0; i < eventList.size(); ++i) {
            BaseEvent event = eventList.get(i);
            if (event.getTimeout() == 0) {
                processEvent(event);
                eventList.remove(i);
                --i;
            } else {
                event.setTimeout(event.getTimeout() - 1);
            }
        }
    }

    private void processEvent(BaseEvent event) {
        //先检查是否执行
        if (!StringUtils.isEmpty(event.getUsername()) && !this.userMap.containsKey(event.getUsername())) {
            return;
        }

        if (event instanceof CreateTankEvent) {
            CreateTankEvent createTankEvent = (CreateTankEvent) event;
            addNewTank(createTankEvent.getUser());
        }
    }

    private void removeBullets() {
        if (removeBulletIds.isEmpty()) {
            return;
        }

        for (String bulletId : removeBulletIds) {
            BulletBo bullet = bulletMap.get(bulletId);
            removeToGridBulletMap(bullet, bullet.getStartGridKey());
            removeToGridBulletMap(bullet, bullet.getEndGridKey());
            bulletMap.remove(bulletId);
            if (tankMap.containsKey(bullet.getTankId())) {
                tankMap.get(bullet.getTankId()).addAmmoCount();
            }
            sendMessageToRoom(ItemDto.convert(bullet), MessageType.REMOVE_BULLET);
        }
        removeBulletIds.clear();
    }

    private void updateBullet(BulletBo bullet) {
        if (this.removeBulletIds.contains(bullet.getId())) {
            return;
        }

        if (bullet.getLifeTime() == 0) {
            addRemoveBulletIds(bullet.getId());
            return;
        }

        if (collideWithAll(bullet)) {
            return;
        }

        bullet.setLifeTime(bullet.getLifeTime() - 1);
        bullet.run();

        //超过1秒没和客户端同步，需要同步一次
        if (System.currentTimeMillis() - bullet.getLastSyncTime() > SYNC_BULLET_TIME) {
            syncBulletList.add(bullet);
        }

        String newStart = CommonUtil.generateGridKey(bullet.getX(), bullet.getY());
        if (newStart.equals(bullet.getStartGridKey())) {
            return;
        }

        removeToGridBulletMap(bullet, bullet.getStartGridKey());
        bullet.setStartGridKey(newStart);

        //newStartKey must equal endKey
        String newEnd = CommonUtil.generateEndGridKey(bullet.getX(), bullet.getY(), bullet.getOrientationType());
        bullet.setEndGridKey(newEnd);
        insertToGridBulletMap(bullet, newEnd);
    }

    /**
     * @param tankBo
     */
    private void updateTank(TankBo tankBo) {
        if (tankBo.getActionType() == ActionType.STOP) {
            return;
        }

        for (String key : tankBo.getGridKeyList()) {
            CollideType type = collideWithAll(tankBo, key);
            if (type != CollideType.COLLIDE_NONE) {
                tankBo.setActionType(ActionType.STOP);
                sendTankToRoom(tankBo, type.toString());
            }
        }
        tankBo.run(tankBo.getType().getSpeed());
        refreshTankGridMap(tankBo);
        addSyncList(tankBo);
    }

    private CollideType collideWithAll(TankBo tankBo, String key) {
        Point grid = CommonUtil.getGridPointFromKey(key);
        if (grid.x < 0 || grid.y < 0 || grid.x >= mapBo.getMaxGridX() || grid.y >= mapBo.getMaxGridY()) {
            //超出范围，停止
            return CollideType.COLLIDE_BOUNDARY;
        }

        if (collideForTank(mapBo.getUnitMap().get(key))) {
            //有障碍物，停止
            return CollideType.COLLIDE_MAP;
        }

        if (collideWithTanks(tankBo, key)) {
            //有其他坦克，停止
            return CollideType.COLLIDE_TANK;
        }
        return CollideType.COLLIDE_NONE;
    }

    private boolean collideWithAll(BulletBo bullet) {
        if (bullet.getX() < 0 || bullet.getY() < 0 || bullet.getX() >= mapBo.getWidth() || bullet.getY() >= mapBo.getHeight()) {
            //超出范围
            addRemoveBulletIds(bullet.getId());
            return true;
        }

        //和地图场景碰撞检测
        if (collideForBullet(mapBo.getUnitMap().get(bullet.getStartGridKey()))) {
            addRemoveBulletIds(bullet.getId());
            processMapWhenCatchAmmo(bullet.getStartGridKey(), bullet);
            return true;
        }

        //和坦克碰撞检测
        TankBo tankBo = collideWithTanks(bullet);
        if (tankBo != null) {
            addRemoveBulletIds(bullet.getId());
            sendTankBombMessage(bullet, tankBo);
            removeTankFromTankId(tankBo.getTankId());
            return true;
        }

        //和子弹碰撞检测
        return collideWithBullets(bullet);
    }

    private void sendTankBombMessage(BulletBo bullet, TankBo tank) {
        //不是玩家，过滤
        if (!tank.getTankId().equals(tank.getUserId())) {
            return;
        }

        String killerName;
        TankBo killer = tankMap.get(bullet.getTankId());
        if (killer == null) {
            killerName = bullet.getTankId();
        } else {
            killerName = killer.getUserId();
        }

        sendMessageToRoom(String.format("%s 被 %s 摧毁了,等待3秒复活...", tank.getTankId(), killerName), MessageType.SYSTEM_MESSAGE);
    }

    private TankBo collideWithTanks(BulletBo bulletBo) {
        TankBo tankBo = collideWithTanks(bulletBo, bulletBo.getStartGridKey());
        if (tankBo != null) {
            return tankBo;
        }
        return collideWithTanks(bulletBo, bulletBo.getEndGridKey());
    }

    private TankBo collideWithTanks(BulletBo bulletBo, String key) {
        if (!gridTankMap.containsKey(key)) {
            return null;
        }

        for (String tankId : gridTankMap.get(key)) {
            TankBo tankBo = tankMap.get(tankId);
            //队伍相同，不检测
            if (tankBo.getTeamType() == bulletBo.getTeamType()) {
                continue;
            }
            double distance = Point.distance(tankBo.getX(), tankBo.getY(), bulletBo.getX(), bulletBo.getY());
            double minDistance = (CommonUtil.AMMO_SIZE + CommonUtil.UNIT_SIZE) / 2.0;
            if (distance <= minDistance) {
                return tankBo;
            }
        }
        return null;
    }

    private boolean collideWithBullets(BulletBo ammo) {
        if (collideWithBullets(ammo, ammo.getStartGridKey())) {
            return true;
        }

        return collideWithBullets(ammo, ammo.getEndGridKey());
    }

    private boolean collideWithBullets(BulletBo ammo, String key) {
        for (String id : gridBulletMap.get(key)) {
            if (id.equals(ammo.getId())) {
                continue;
            }

            BulletBo target = bulletMap.get(id);
            double distance = Point.distance(ammo.getX(), ammo.getY(), target.getX(), target.getY());
            if (distance <= CommonUtil.AMMO_SIZE) {
                addRemoveBulletIds(ammo.getId());
                addRemoveBulletIds(target.getId());
                return true;
            }
        }
        return false;
    }

    private void processMapWhenCatchAmmo(String key, BulletBo bulletBo) {
        MapUnitType mapUnitType = mapBo.getUnitMap().get(key);

        if (mapUnitType == MapUnitType.IRON && bulletBo.isBrokenIron()) {
            changeMap(key, MapUnitType.BROKEN_IRON);
            return;
        }

        if (mapUnitType == MapUnitType.BROKEN_IRON && bulletBo.isBrokenIron()) {
            removeMap(key);
            return;
        }

        if (mapUnitType == MapUnitType.BRICK) {
            changeMap(key, MapUnitType.BROKEN_BRICK);
            return;
        }

        if (mapUnitType == MapUnitType.BROKEN_BRICK) {
            removeMap(key);
            return;
        }

        if (mapUnitType == MapUnitType.RED_KING) {
            removeMap(key);
            this.isPause = true;
            sendMessageToRoom(getTeam(TeamType.BLUE) + "胜利", MessageType.GAME_STATUS);
            return;
        }

        if (mapUnitType == MapUnitType.BLUE_KING) {
            removeMap(key);
            this.isPause = true;
            sendMessageToRoom(getTeam(TeamType.RED) + "胜利", MessageType.GAME_STATUS);
        }
    }

    private void changeMap(String key, MapUnitType type) {
        mapBo.getUnitMap().put(key, type);
        sendMessageToRoom(MapDto.convert(key, type), MessageType.MAP);
    }

    private void removeMap(String key) {
        mapBo.getUnitMap().remove(key);
        sendMessageToRoom(key, MessageType.REMOVE_MAP);
    }

    private boolean collideWithTanks(TankBo tankBo, String key) {
        if (gridTankMap.containsKey(key)) {
            for (String tankId : gridTankMap.get(key)) {
                //跳过自己
                if (tankId.equals(tankBo.getTankId())) {
                    continue;
                }

                TankBo target = tankMap.get(tankId);
                if (collide(tankBo, target)) {
                    //和其他坦克相撞
                    return true;
                }
            }
        }
        return false;
    }

    private boolean collide(TankBo tank1, TankBo tank2) {
        double distance = Point.distance(tank1.getX(), tank1.getY(), tank2.getX(), tank2.getY());
        boolean isCollide = distance <= CommonUtil.UNIT_SIZE;
        switch (tank1.getOrientationType()) {
            case UP:
                if (isCollide && tank2.getY() < tank1.getY()) {
                    return true;
                }
                break;
            case DOWN:
                if (isCollide && tank2.getY() > tank1.getY()) {
                    return true;
                }
                break;
            case LEFT:
                if (isCollide && tank2.getX() < tank1.getX()) {
                    return true;
                }
                break;
            case RIGHT:
                if (isCollide && tank2.getX() > tank1.getX()) {
                    return true;
                }
                break;
            default:
                break;
        }
        return false;
    }

    private boolean collideForTank(MapUnitType mapUnitType) {
        if (mapUnitType == null) {
            return false;
        }
        return mapUnitType != MapUnitType.GRASS;
    }

    private boolean collideForBullet(MapUnitType mapUnitType) {
        if (mapUnitType == null) {
            return false;
        }
        return mapUnitType != MapUnitType.GRASS && mapUnitType != MapUnitType.RIVER;
    }

    @Override
    void removeTankExtension(TankBo tankBo) {
        for (String key : tankBo.getGridKeyList()) {
            removeToGridTankMap(tankBo, key);
        }
        //check status
        if (checkGameStatusAfterTankBomb(tankBo)) {
            return;
        }

        //recreate
        UserBo userBo = this.userMap.get(tankBo.getUserId());
        if (userBo != null) {
            this.eventList.add(new CreateTankEvent(userBo, 60 * 3));
        }
    }

    private boolean checkGameStatusAfterTankBomb(TankBo tankBo) {
        if (tankBo.getTeamType() == TeamType.RED) {
            mapBo.setPlayerLifeTotalCount(mapBo.getPlayerLifeTotalCount() - 1);
        } else {
            mapBo.setComputerLifeTotalCount(mapBo.getComputerLifeTotalCount() - 1);
        }

        if (mapBo.getPlayerLifeTotalCount() <= 0) {
            this.isPause = true;
            sendMessageToRoom(getTeam(TeamType.BLUE) + "胜利", MessageType.GAME_STATUS);
            return true;
        }
        if (mapBo.getComputerLifeTotalCount() <= 0) {
            this.isPause = true;
            sendMessageToRoom(getTeam(TeamType.RED) + "胜利", MessageType.GAME_STATUS);
            return true;
        }
        return false;
    }

    @Override
    public void removeUser(String username) {
        if (!userMap.containsKey(username)) {
            return;
        }
        UserBo userBo = userMap.get(username);
        userMap.remove(username);
        removeTankFromUserId(username);
        if (getUserCount() == 0) {
            return;
        }
        sendStatusAndMessage(userBo, true);
    }

    private void sendStatusAndMessage(UserBo user, boolean leave) {
        sendMessageToRoom(getUserList(), MessageType.USERS);
        String message;
        if (leave) {
            message = String.format("%s 离开了房间 %s,当前房间人数: %d", generateUsernameWithTeam(user), roomId, getUserCount());
        } else {
            message = String.format("%s 加入了房间 %s,当前房间人数: %d", generateUsernameWithTeam(user), roomId, getUserCount());
        }
        sendMessageToRoom(message, MessageType.SYSTEM_MESSAGE);
    }

    private String generateUsernameWithTeam(UserBo userBo) {
        return String.format("%s[%s]", userBo.getUsername(), getTeam(userBo.getTeamType()));
    }

    private String getTeam(TeamType teamType) {
        String teamStr = "观看";
        switch (this.roomType) {
            case EVE:
            case PVP:
                switch (teamType) {
                    case RED:
                        teamStr = "红队";
                        break;
                    case BLUE:
                        teamStr = "蓝队";
                        break;
                    default:
                        break;
                }
                break;
            case PVE:
                switch (teamType) {
                    case RED:
                        teamStr = "玩家";
                        break;
                    case BLUE:
                        teamStr = "AI";
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
        return teamStr;
    }

    public void addUser(UserBo userBo, TeamType teamType) {
        userMap.put(userBo.getUsername(), userBo);
        userBo.setRoomId(this.roomId);
        userBo.setTeamType(teamType);
        sendStatusAndMessage(userBo, false);

        //发送场景信息
        sendMessageToUser(MapDto.convert(mapBo), MessageType.MAP, userBo.getUsername());
        sendMessageToUser(getTankList(), MessageType.TANKS, userBo.getUsername());
        sendMessageToUser(getBulletList(), MessageType.BULLET, userBo.getUsername());

        this.eventList.add(new CreateTankEvent(userBo, 60 * 3));

        //通知前端数据传输完毕
        sendReady(userBo.getUsername());
    }

    private void addNewTank(UserBo userBo) {
        if (userBo.getTeamType() == TeamType.VIEW) {
            return;
        }

        Map<String, Integer> lifeMap = getLifeMap(userBo.getTeamType());
        if (lifeMap.isEmpty()) {
            sendMessageToRoom(
                String.format("没有剩余生命值，玩家 %s 将变成观看模式",
                              userBo.getUsername()), MessageType.SYSTEM_MESSAGE);
            return;
        }

        TankBo tankBo = new TankBo();
        tankBo.setTankId(userBo.getUsername());
        tankBo.setUserId(userBo.getUsername());
        tankBo.setTeamType(userBo.getTeamType());
        tankBo.setType(getTankType(lifeMap));
        setStartPoint(tankBo);
        tankBo.setAmmoCount(tankBo.getType().getAmmoMaxCount());
        tankMap.put(tankBo.getTankId(), tankBo);

        //即将向所有人同步信息
        sendTankToRoom(tankBo);
    }

    /**
     * 根据队伍获得类型，并且更新life
     *
     * @param lifeMap
     * @return
     */
    private TankTypeBo getTankType(Map<String, Integer> lifeMap) {
        List<String> types = new ArrayList<>();
        List<Integer> min = new ArrayList<>();
        List<Integer> max = new ArrayList<>();
        int totalCount = 0;
        for (Map.Entry<String, Integer> kv : lifeMap.entrySet()) {
            types.add(kv.getKey());
            min.add(totalCount);
            totalCount += kv.getValue();
            max.add(totalCount - 1);
        }
        int index = random.nextInt(totalCount);
        String selectType = null;
        for (int i = 0; i < types.size(); ++i) {
            if (CommonUtil.betweenAnd(index, min.get(i), max.get(i))) {
                selectType = types.get(i);
                break;
            }
        }
        int lastCount = lifeMap.get(selectType) - 1;
        if (lastCount == 0) {
            lifeMap.remove(selectType);
        } else {
            lifeMap.put(selectType, lastCount);
        }
        sendMessageToRoom(MapDto.convertLifeCount(mapBo), MessageType.MAP);
        return TankTypeBo.getTankType(selectType);
    }

    private Map<String, Integer> getLifeMap(TeamType teamType) {
        if (teamType == TeamType.RED) {
            return mapBo.getPlayerLife();
        } else {
            return mapBo.getComputerLife();
        }
    }

    private List<ItemDto> getTankList() {
        List<ItemDto> tankDtoList = new ArrayList<>();
        for (Map.Entry<String, TankBo> kv : tankMap.entrySet()) {
            tankDtoList.add(ItemDto.convert(kv.getValue()));
        }
        return tankDtoList;
    }

    private List<ItemDto> getBulletList() {
        List<ItemDto> bulletDtoList = new ArrayList<>();
        for (Map.Entry<String, BulletBo> kv : bulletMap.entrySet()) {
            bulletDtoList.add(ItemDto.convert(kv.getValue()));
        }
        return bulletDtoList;
    }

    private void setStartPoint(TankBo tankBo) {
        String posStr;
        if (tankBo.getTeamType() == TeamType.RED) {
            posStr = mapBo.getPlayerStartPoints().get(random.nextInt(mapBo.getPlayerStartPoints().size()));
        } else {
            posStr = mapBo.getComputerStartPoints().get(random.nextInt(mapBo.getComputerStartPoints().size()));
        }
        tankBo.getGridKeyList().add(posStr);
        insertToGridTankMap(tankBo, posStr);
        Point point = CommonUtil.getPointFromKey(posStr);
        tankBo.setX(point.getX());
        tankBo.setY(point.getY());
    }

    private void insertToGridTankMap(TankBo tankBo, String key) {
        if (!gridTankMap.containsKey(key)) {
            gridTankMap.put(key, new ArrayList<>());
        }
        if (!gridTankMap.get(key).contains(tankBo.getTankId())) {
            gridTankMap.get(key).add(tankBo.getTankId());
        }
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

    private void insertToGridBulletMap(BulletBo bullet, String key) {
        if (!gridBulletMap.containsKey(key)) {
            gridBulletMap.put(key, new ArrayList<>());
        }
        if (!gridBulletMap.get(key).contains(bullet.getId())) {
            gridBulletMap.get(key).add(bullet.getId());
        }
    }

    private void removeToGridBulletMap(BulletBo bullet, String key) {
        if (!gridBulletMap.containsKey(key)) {
            return;
        }
        gridBulletMap.get(key).remove(bullet.getId());
        if (gridBulletMap.get(key).isEmpty()) {
            gridBulletMap.remove(key);
        }
    }

    @Override
    void updateTankControlExtension(TankBo tankBo, ItemDto tankDto) {
        //TODO - 距离检测，防止作弊

        tankBo.setX(tankDto.getX());
        tankBo.setY(tankDto.getY());
        refreshTankGridMap(tankBo);
    }

    private void refreshTankGridMap(TankBo tankBo) {
        List<String> newKeys = tankBo.generateGridKeyList();
        for (String oldKey : tankBo.getGridKeyList()) {
            if (!newKeys.contains(oldKey)) {
                removeToGridTankMap(tankBo, oldKey);
            }
        }
        for (String newKey : newKeys) {
            if (!tankBo.getGridKeyList().contains(newKey)) {
                insertToGridTankMap(tankBo, newKey);
            }
        }
        tankBo.setGridKeyList(newKeys);
    }

    @Override
    void processTankFireExtension(BulletBo bullet) {
        String startKey = CommonUtil.generateGridKey(bullet.getX(), bullet.getY());
        bullet.setStartGridKey(startKey);
        insertToGridBulletMap(bullet, startKey);

        String endKey = CommonUtil.generateEndGridKey(bullet.getX(), bullet.getY(), bullet.getOrientationType());
        bullet.setEndGridKey(endKey);
        insertToGridBulletMap(bullet, endKey);
    }
}
