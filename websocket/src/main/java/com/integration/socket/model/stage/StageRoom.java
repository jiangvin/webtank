package com.integration.socket.model.stage;

import com.integration.dto.message.MessageType;
import com.integration.dto.map.ActionType;
import com.integration.socket.model.CollideType;
import com.integration.dto.map.MapUnitType;
import com.integration.dto.room.RoomType;
import com.integration.dto.room.TeamType;
import com.integration.socket.model.bo.BulletBo;
import com.integration.socket.model.bo.MapBo;
import com.integration.socket.model.bo.MapMangerBo;
import com.integration.socket.model.bo.TankBo;
import com.integration.socket.model.bo.TankTypeBo;
import com.integration.socket.model.bo.UserBo;
import com.integration.dto.map.ItemDto;
import com.integration.dto.map.MapDto;
import com.integration.dto.room.RoomDto;
import com.integration.socket.model.event.BaseEvent;
import com.integration.socket.model.event.CreateTankEvent;
import com.integration.socket.model.event.LoadMapEvent;
import com.integration.socket.model.event.MessageEvent;
import com.integration.socket.service.MessageService;
import com.integration.util.CommonUtil;
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

    public StageRoom(RoomDto roomDto, MapMangerBo mapManger, MessageService messageService) {
        super(messageService);
        this.roomId = roomDto.getRoomId();
        this.creator = roomDto.getCreator();
        this.mapManger = mapManger;
    }

    public RoomDto convertToDto() {
        RoomDto roomDto = new RoomDto();
        roomDto.setRoomId(getRoomId());
        roomDto.setCreator(getCreator());
        roomDto.setMapId(getMapId());
        roomDto.setRoomType(getRoomType());
        roomDto.setUserCount(getUserCount());
        return roomDto;
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

    @Getter
    private String roomId;

    @Getter
    private String creator;

    public String getMapId() {
        return mapManger.getMapBo().getMapId();
    }

    public RoomType getRoomType() {
        return mapManger.getRoomType();
    }

    private MapBo getMapBo() {
        return mapManger.getMapBo();
    }

    private MapMangerBo mapManger;

    private Random random = new Random();

    private boolean isPause = false;
    private String pauseMessage;

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
            dtoList.add(tank.convertToDto());
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
            dtoList.add(bullet.convertToDto());
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
        if (!StringUtils.isEmpty(event.getUsernameCheck()) && !this.userMap.containsKey(event.getUsernameCheck())) {
            return;
        }

        if (event instanceof CreateTankEvent) {
            CreateTankEvent createTankEvent = (CreateTankEvent) event;
            addNewTank(createTankEvent.getUser(), createTankEvent.getTankId());
            return;
        }

        if (event instanceof MessageEvent) {
            MessageEvent messageEvent = (MessageEvent) event;
            sendMessageToRoom(messageEvent.getContent(), messageEvent.getMessageType());
            return;
        }

        if (event instanceof LoadMapEvent) {
            sendMessageToRoom(getMapBo().convertToDto(), MessageType.MAP);
            this.isPause = false;
            sendMessageToRoom(null, MessageType.SERVER_READY);
            //1 ~ 5 秒陆续出现坦克
            for (Map.Entry<String, UserBo> kv : userMap.entrySet()) {
                createTankForUser(kv.getValue(), kv.getValue().getTeamType(), random.nextInt(60 * 4) + 60);
            }
        }
    }

    private void removeBullets() {
        if (removeBulletIds.isEmpty()) {
            return;
        }

        for (String bulletId : removeBulletIds) {
            BulletBo bullet = bulletMap.get(bulletId);
            if (bullet == null) {
                continue;
            }
            removeToGridBulletMap(bullet, bullet.getStartGridKey());
            removeToGridBulletMap(bullet, bullet.getEndGridKey());
            bulletMap.remove(bulletId);
            if (tankMap.containsKey(bullet.getTankId())) {
                tankMap.get(bullet.getTankId()).addAmmoCount();
            }
            sendMessageToRoom(bullet.convertToDto(), MessageType.REMOVE_BULLET);
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
        if (tankBo.getReloadTime() > 0) {
            tankBo.setReloadTime(tankBo.getReloadTime() - 1);
        }

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
        if (grid.x < 0 || grid.y < 0 || grid.x >= getMapBo().getMaxGridX() || grid.y >= getMapBo().getMaxGridY()) {
            //超出范围，停止
            return CollideType.COLLIDE_BOUNDARY;
        }

        if (collideForTank(getMapBo().getUnitMap().get(key))) {
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
        if (bullet.getX() < 0 || bullet.getY() < 0 || bullet.getX() >= getMapBo().getWidth() || bullet.getY() >= getMapBo().getHeight()) {
            //超出范围
            addRemoveBulletIds(bullet.getId());
            return true;
        }

        //和地图场景碰撞检测
        if (collideForBullet(getMapBo().getUnitMap().get(bullet.getStartGridKey()))) {
            addRemoveBulletIds(bullet.getId());
            processMapWhenCatchAmmo(bullet.getStartGridKey(), bullet);
            return true;
        }

        //和坦克碰撞检测
        TankBo tankBo = collideWithTanks(bullet);
        if (tankBo != null) {
            addRemoveBulletIds(bullet.getId());
            sendTankBombMessage(tankBo);
            removeTankFromTankId(tankBo.getTankId());
            return true;
        }

        //和子弹碰撞检测
        return collideWithBullets(bullet);
    }

    private void sendTankBombMessage(TankBo tank) {
        //不是玩家，过滤
        if (!tank.getTankId().equals(tank.getUserId())) {
            return;
        }

        sendMessageToRoom(String.format("%s 被摧毁了,等待3秒复活...", tank.getTankId()), MessageType.SYSTEM_MESSAGE);
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
            if (target.getTeamType() == ammo.getTeamType()) {
                continue;
            }

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
        MapUnitType mapUnitType = getMapBo().getUnitMap().get(key);

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
            processGameOver(TeamType.BLUE);
            return;
        }

        if (mapUnitType == MapUnitType.BLUE_KING) {
            removeMap(key);
            processGameOver(TeamType.RED);
        }
    }

    private void processGameOver(TeamType winTeam) {
        this.isPause = true;
        boolean processNextMap = true;

        if (getRoomType() == RoomType.PVE) {
            if (winTeam == TeamType.RED) {
                this.pauseMessage = "恭喜通关";
            } else {
                this.pauseMessage = "游戏失败";
                processNextMap = false;
            }
        } else {
            this.pauseMessage = getTeam(winTeam) + "胜利!";
        }
        sendMessageToRoom(this.pauseMessage, MessageType.GAME_STATUS);

        if (!processNextMap) {
            return;
        }

        if (!mapManger.loadNextMap()) {
            return;
        }

        clear();
        long loadTimeoutSeconds = 10;
        long cleanMapTimeoutSeconds = 6;
        this.pauseMessage = "正在加载下一张地图...";
        sendMessageToRoom("10秒后加载下一张地图...", MessageType.SYSTEM_MESSAGE);
        for (int i = 1; i < loadTimeoutSeconds; ++i) {
            String content = String.format("%d秒后加载下一张地图...", i);
            MessageEvent messageEvent = new MessageEvent(content, MessageType.SYSTEM_MESSAGE);
            messageEvent.setTimeout((loadTimeoutSeconds - i) * 60);
            this.eventList.add(messageEvent);
        }
        //清空地图
        MessageEvent cleanEvent = new MessageEvent(null, MessageType.CLEAR_MAP);
        cleanEvent.setTimeout(cleanMapTimeoutSeconds * 60);
        this.eventList.add(cleanEvent);

        //更改标题
        MessageEvent changeTitle = new MessageEvent(this.pauseMessage, MessageType.GAME_STATUS);
        changeTitle.setTimeout(cleanMapTimeoutSeconds * 60);
        this.eventList.add(changeTitle);

        //加载新地图
        LoadMapEvent loadEvent = new LoadMapEvent();
        loadEvent.setTimeout(loadTimeoutSeconds * 60);
        this.eventList.add(loadEvent);
    }

    private void clear() {
        this.tankMap.clear();
        this.bulletMap.clear();
        this.gridBulletMap.clear();
        this.gridTankMap.clear();
        this.removeBulletIds.clear();
        this.eventList.clear();
        this.syncTankList.clear();
        this.syncBulletList.clear();
    }

    private void changeMap(String key, MapUnitType type) {
        getMapBo().getUnitMap().put(key, type);
        sendMessageToRoom(MapDto.convert(key, type), MessageType.MAP);
    }

    private void removeMap(String key) {
        getMapBo().getUnitMap().remove(key);
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
            this.eventList.add(new CreateTankEvent(userBo, tankBo.getTankId(), 60 * 3));
        }
    }

    private boolean checkGameStatusAfterTankBomb(TankBo tankBo) {
        if (tankBo.getTeamType() == TeamType.RED) {
            getMapBo().setPlayerLifeTotalCount(getMapBo().getPlayerLifeTotalCount() - 1);
        } else {
            getMapBo().setComputerLifeTotalCount(getMapBo().getComputerLifeTotalCount() - 1);
        }

        if (getMapBo().getPlayerLifeTotalCount() <= 0) {
            processGameOver(TeamType.BLUE);
            return true;
        }
        if (getMapBo().getComputerLifeTotalCount() <= 0) {
            processGameOver(TeamType.RED);
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
        switch (getRoomType()) {
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
        if (this.isPause) {
            sendMessageToUser(this.pauseMessage, MessageType.GAME_STATUS, userBo.getUsername());
        }
        sendMessageToUser(getMapBo().convertToDto(), MessageType.MAP, userBo.getUsername());
        sendMessageToUser(getTankList(), MessageType.TANKS, userBo.getUsername());
        sendMessageToUser(getBulletList(), MessageType.BULLET, userBo.getUsername());

        createTankForUser(userBo, teamType, 60 * 3);

        //通知前端数据传输完毕
        sendReady(userBo.getUsername());
    }

    private void createTankForUser(UserBo userBo, TeamType teamType, int timeoutForPlayer) {
        boolean createForComputer = false;
        if (getRoomType() == RoomType.EVE) {
            createForComputer = true;
        } else if (getRoomType() == RoomType.PVE && teamType == TeamType.BLUE) {
            createForComputer = true;
        }

        if (!createForComputer) {
            this.eventList.add(new CreateTankEvent(userBo, timeoutForPlayer));
            return;
        }

        for (int i = 0; i < getMapBo().getComputerStartCount(); ++i) {
            this.eventList.add(new CreateTankEvent(
                                   userBo,
                                   CommonUtil.getId(),
                                   60 * random.nextInt(getMapBo().getComputerStartCount())));
        }
    }

    private void addNewTank(UserBo userBo, String tankId) {
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
        tankBo.setTankId(tankId);
        tankBo.setUserId(userBo.getUsername());
        tankBo.setTeamType(userBo.getTeamType());
        tankBo.setType(getTankType(lifeMap));
        setStartPoint(tankBo);
        tankBo.setBulletCount(tankBo.getType().getAmmoMaxCount());
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
        sendMessageToRoom(getMapBo().convertLifeCountToDto(), MessageType.MAP);
        return TankTypeBo.getTankType(selectType);
    }

    private Map<String, Integer> getLifeMap(TeamType teamType) {
        if (teamType == TeamType.RED) {
            return getMapBo().getPlayerLife();
        } else {
            return getMapBo().getComputerLife();
        }
    }

    private List<ItemDto> getTankList() {
        List<ItemDto> tankDtoList = new ArrayList<>();
        for (Map.Entry<String, TankBo> kv : tankMap.entrySet()) {
            tankDtoList.add(kv.getValue().convertToDto());
        }
        return tankDtoList;
    }

    private List<ItemDto> getBulletList() {
        List<ItemDto> bulletDtoList = new ArrayList<>();
        for (Map.Entry<String, BulletBo> kv : bulletMap.entrySet()) {
            bulletDtoList.add(kv.getValue().convertToDto());
        }
        return bulletDtoList;
    }

    private void setStartPoint(TankBo tankBo) {
        String posStr;
        if (tankBo.getTeamType() == TeamType.RED) {
            posStr = getMapBo().getPlayerStartPoints().get(random.nextInt(getMapBo().getPlayerStartPoints().size()));
        } else {
            posStr = getMapBo().getComputerStartPoints().get(random.nextInt(getMapBo().getComputerStartPoints().size()));
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

        if (tankDto.getX() != null && tankDto.getY() != null) {
            tankBo.setX(tankDto.getX());
            tankBo.setY(tankDto.getY());
        }
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
