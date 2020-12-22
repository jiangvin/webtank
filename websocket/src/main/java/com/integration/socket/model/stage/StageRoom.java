package com.integration.socket.model.stage;

import com.integration.dto.map.ActionType;
import com.integration.dto.map.ItemDto;
import com.integration.dto.map.MapDto;
import com.integration.dto.map.MapUnitType;
import com.integration.dto.map.OrientationType;
import com.integration.dto.message.MessageType;
import com.integration.dto.room.GameStatusDto;
import com.integration.dto.room.GameStatusType;
import com.integration.dto.room.RoomDto;
import com.integration.dto.room.RoomType;
import com.integration.dto.room.TeamType;
import com.integration.socket.model.CollideType;
import com.integration.socket.model.ItemType;
import com.integration.socket.model.bo.BulletBo;
import com.integration.socket.model.bo.ItemBo;
import com.integration.socket.model.bo.MapBo;
import com.integration.socket.model.bo.MapMangerBo;
import com.integration.socket.model.bo.ScoreBo;
import com.integration.socket.model.bo.TankBo;
import com.integration.socket.model.bo.UserBo;
import com.integration.socket.model.bot.BaseBotBo;
import com.integration.socket.model.dto.StarDto;
import com.integration.socket.model.dto.StringCountDto;
import com.integration.socket.model.dto.TankTypeDto;
import com.integration.socket.model.event.BaseEvent;
import com.integration.socket.model.event.ClockEvent;
import com.integration.socket.model.event.CreateItemEvent;
import com.integration.socket.model.event.CreateTankEvent;
import com.integration.socket.model.event.IronKingEvent;
import com.integration.socket.model.event.LoadMapEvent;
import com.integration.socket.model.event.MessageEvent;
import com.integration.socket.repository.jooq.tables.records.UserRecord;
import com.integration.socket.service.MapStarService;
import com.integration.socket.service.MessageService;
import com.integration.socket.service.UserService;
import com.integration.util.CommonUtil;
import com.integration.util.model.CustomException;
import com.integration.util.time.TimeUtil;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.util.StringUtils;

import java.awt.Point;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/4
 */

@Slf4j
public class StageRoom extends BaseStage {

    private static final int MAX_ITEM_LIMIT = 3;
    private static final int TRY_TIMES_OF_CREATE_ITEM = 10;
    private static final int DEFAULT_SHIELD_TIME = 20 * 60;
    private static final int DEFAULT_SHIELD_TIME_FOR_NEW_TANK = 3 * 60;

    private Map<String, ItemBo> itemMap = new ConcurrentHashMap<>();

    private List<BaseEvent> eventList = new ArrayList<>();

    /**
     * 要删除的子弹列表，每帧刷新
     */
    private Set<String> removeBulletIds = new HashSet<>();

    /**
     * 要更新的坦克列表，保证坦克每秒和客户端同步一次
     */
    @Getter
    private Set<TankBo> syncTankList = new HashSet<>();

    /**
     * BOT列表
     */
    private Map<String, BaseBotBo> botMap = new ConcurrentHashMap<>();

    /**
     * 在通关后记录玩家属性
     */
    private Map<String, TankBo> tankStatusSaveMap = new ConcurrentHashMap<>();

    @Getter
    private String roomId;

    private boolean hardMode;

    private UserBo creator;

    private MapMangerBo mapManger;

    private Random random = new Random();

    /**
     * 计分相关
     */
    private ScoreBo scoreBo = new ScoreBo();
    private UserService userService;
    private MapStarService mapStarService;

    /**
     * 道具池
     */
    private List<ItemType> itemTypePool = new ArrayList<>();

    public StageRoom(RoomDto roomDto,
                     UserBo creator,
                     MapMangerBo mapManger,
                     MessageService messageService,
                     UserService userService,
                     MapStarService mapStarService) {
        super(messageService);
        this.roomId = roomDto.getRoomId();
        this.hardMode = roomDto.isHardMode();
        this.creator = creator;
        this.mapManger = mapManger;
        this.userService = userService;
        this.mapStarService = mapStarService;
        init();
    }

    private void initItemPool() {
        itemTypePool.clear();
        itemTypePool.addAll(Arrays.asList(ItemType.values()));
        boolean hasRedStar = false;
        boolean hasGhost = false;
        boolean hasClock = false;
        for (Map.Entry<String, UserBo> kv : userMap.entrySet()) {
            UserBo user = kv.getValue();
            if (!hasRedStar && user.hasRedStar()) {
                hasRedStar = true;
            }
            if (!hasGhost && user.hasGhost()) {
                hasGhost = true;
            }
            if (!hasClock && user.hasClock()) {
                hasClock = true;
            }
            if (hasRedStar && hasGhost && hasClock) {
                break;
            }
        }

        if (!hasRedStar) {
            itemTypePool.remove(ItemType.RED_STAR);
        }
        if (!hasGhost) {
            itemTypePool.remove(ItemType.GHOST);
        }
        if (!hasClock) {
            itemTypePool.remove(ItemType.CLOCK);
        }
    }

    public RoomDto toDto() {
        RoomDto roomDto = new RoomDto();
        roomDto.setRoomId(getRoomId());
        roomDto.setCreator(this.creator.getUsername());
        roomDto.setMapId(getMapId());
        roomDto.setSubId(getSubId());
        roomDto.setRoomType(getRoomType());
        roomDto.setUserCount(getUserCount());
        return roomDto;
    }

    private void init() {
        this.tankMap.clear();
        this.bulletMap.clear();
        this.itemMap.clear();
        this.removeBulletIds.clear();
        this.eventList.clear();
        this.syncTankList.clear();

        initItemPool();
        this.scoreBo.init();
        this.gameStatus.init();

        this.eventList.add(new CreateItemEvent());
    }

    private int saveTankType() {
        this.tankStatusSaveMap.clear();
        for (Map.Entry<String, TankBo> kv : tankMap.entrySet()) {
            TankBo tankBo = kv.getValue();
            if (tankBo.isBot()) {
                continue;
            }
            this.tankStatusSaveMap.put(tankBo.getUserId(), tankBo);
        }
        return this.tankStatusSaveMap.size();
    }

    private int getMapId() {
        return mapManger.getMapId();
    }

    private int getSubId() {
        return mapManger.getSubId();
    }

    private RoomType getRoomType() {
        return mapManger.getRoomType();
    }

    private MapBo getMapBo() {
        return mapManger.getMapBo();
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
    @Async
    public void update() {
        processEvent();

        if (gameStatus.isPause()) {
            return;
        }

        for (Map.Entry<String, BaseBotBo> kv : botMap.entrySet()) {
            kv.getValue().update();
        }

        for (Map.Entry<String, BulletBo> kv : bulletMap.entrySet()) {
            updateBullet(kv.getValue());
        }
        removeBullets();

        for (Map.Entry<String, TankBo> kv : tankMap.entrySet()) {
            updateTank(kv.getValue());
        }
        syncTanks();
    }

    private void syncTanks() {
        if (syncTankList.isEmpty()) {
            return;
        }

        List<ItemDto> dtoList = new ArrayList<>();
        for (TankBo tank : syncTankList) {
            dtoList.add(tank.toDto());
        }
        sendMessageToRoom(dtoList, MessageType.TANKS);
        syncTankList.clear();
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
        if (!StringUtils.isEmpty(event.getUsernameCheck()) &&
                !this.userMap.containsKey(event.getUsernameCheck()) &&
                !this.botMap.containsKey(event.getUsernameCheck())) {
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

        if (event instanceof ClockEvent) {
            if (gameStatus.getType() != GameStatusType.NORMAL) {
                gameStatus.setType(GameStatusType.NORMAL);
                sendMessageToRoom(gameStatus, MessageType.GAME_STATUS);
            }
            return;
        }

        if (event instanceof LoadMapEvent) {
            sendMessageToRoom(getMapBo().toDto(), MessageType.MAP);
            gameStatus.setType(GameStatusType.NORMAL);
            sendMessageToRoom(gameStatus, MessageType.GAME_STATUS);
            //1 ~ 5 秒陆续出现坦克
            for (Map.Entry<String, UserBo> kv : userMap.entrySet()) {
                createTankForUser(kv.getValue(), random.nextInt(60 * 4) + 60);
            }
            for (Map.Entry<String, BaseBotBo> kv : botMap.entrySet()) {
                createTankForUser(kv.getValue().getBotUser(), random.nextInt(60 * 4) + 60);
            }
            return;
        }

        if (event instanceof IronKingEvent) {
            IronKingEvent ironKingEvent = (IronKingEvent) event;
            List<String> keys = ironKingEvent.getKeys();
            for (int i = 0; i < keys.size(); ++i) {
                String key = keys.get(i);
                if (!getMapBo().getUnitMap().containsKey(key)) {
                    keys.remove(i);
                    --i;
                } else {
                    getMapBo().getUnitMap().put(key, MapUnitType.BRICK);
                }
            }
            sendMessageToRoom(getMapBo().toDtoWithKeys(keys), MessageType.MAP);
            return;
        }

        if (event instanceof CreateItemEvent) {
            createGameItem();
            CreateItemEvent createItemEvent = (CreateItemEvent) event;
            createItemEvent.resetTimeout();
            this.eventList.add(createItemEvent);
        }
    }

    private void createGameItem() {
        if (itemMap.size() >= MAX_ITEM_LIMIT) {
            return;
        }

        ItemType itemType = itemTypePool.get(random.nextInt(itemTypePool.size()));
        for (int time = 0; time < TRY_TIMES_OF_CREATE_ITEM; ++time) {
            Point grid = new Point();
            grid.x = random.nextInt(getMapBo().getMaxGridX());
            grid.y = random.nextInt(getMapBo().getMaxGridY());
            String key = CommonUtil.generateKey(grid.x, grid.y);
            if (getMapBo().getUnitMap().containsKey(key)) {
                continue;
            }
            if (itemMap.containsKey(key)) {
                continue;
            }
            Point pos = CommonUtil.getPointFromKey(key);
            ItemBo itemBo = new ItemBo(key, pos, CommonUtil.getId(), itemType);
            itemMap.put(key, itemBo);
            sendMessageToRoom(Collections.singletonList(itemBo.toDto()), MessageType.ITEM);
            break;
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
            this.removeBulletIds.add(bullet.getId());
            return;
        }

        if (collideWithAll(bullet)) {
            return;
        }

        bullet.setLifeTime(bullet.getLifeTime() - 1);
        bullet.run();
    }

    /**
     * @param tankBo
     */
    private void updateTank(TankBo tankBo) {
        //查看是否为暂停状态
        if (gameStatus.getType() == GameStatusType.PAUSE_RED && tankBo.getTeamType() == TeamType.RED) {
            return;
        }
        if (gameStatus.getType() == GameStatusType.PAUSE_BLUE && tankBo.getTeamType() == TeamType.BLUE) {
            return;
        }

        boolean needUpdate = false;

        //填装弹药计算
        if (tankBo.getReloadTime() > 0) {
            tankBo.setReloadTime(tankBo.getReloadTime() - 1);
            if (tankBo.getReloadTime() == 0) {
                needUpdate = true;
            }
        }

        //护盾计算
        if (tankBo.getShieldTimeout() > 0) {
            tankBo.setShieldTimeout(tankBo.getShieldTimeout() - 1);
            if (!tankBo.hasShield()) {
                needUpdate = true;
            }
        }

        //移动计算
        if (tankBo.getActionType() == ActionType.RUN) {
            boolean canRun = true;
            CollideType type = canPass(tankBo);
            if (type != CollideType.COLLIDE_NONE) {
                tankBo.setActionType(ActionType.STOP);
                sendTankToRoom(tankBo, type.toString());
                //已经发送了一次，重置标识
                needUpdate = false;
                canRun = false;
            }

            if (canRun) {
                if (catchItem(tankBo)) {
                    needUpdate = true;
                }
                tankBo.run(tankBo.getType().getSpeed());
            }
        }

        if (needUpdate) {
            syncTankList.add(tankBo);
        }
    }

    public CollideType canPass(TankBo tank) {
        return canPass(tank, tank.getOrientationType());
    }

    public CollideType canPass(TankBo tank, OrientationType orientation) {
        //先判断，增加效率，防止遍历2次
        if (collideWithTanks(tank, orientation)) {
            return CollideType.COLLIDE_TANK;
        }

        //获取前方的两个角的坐标（顺时针获取）
        List<Point> corners = generateCorners(tank, orientation);
        for (Point corner : corners) {
            CollideType result = canPass(corner, tank.isHasGhost());
            if (result != CollideType.COLLIDE_NONE) {
                return result;
            }
        }
        return CollideType.COLLIDE_NONE;
    }

    private CollideType canPass(Point point, boolean hasGhost) {
        if (point.x < 0 || point.y < 0 || point.x >= getMapBo().getWidth() || point.y >= getMapBo().getHeight()) {
            return CollideType.COLLIDE_BOUNDARY;
        }

        //幽灵状态无视一切障碍
        if (hasGhost) {
            return CollideType.COLLIDE_NONE;
        }

        if (collideWithMap(point)) {
            return CollideType.COLLIDE_MAP;
        }
        return CollideType.COLLIDE_NONE;
    }

    private boolean collideWithTanks(TankBo tank, OrientationType orientation) {
        if (tank.isHasGhost()) {
            return false;
        }

        for (Map.Entry<String, TankBo> kv : tankMap.entrySet()) {
            TankBo target = kv.getValue();
            if (target.getTankId().equals(tank.getTankId())) {
                continue;
            }

            if (target.isHasGhost()) {
                continue;
            }

            double distance = Point.distance(tank.getX(), tank.getY(), target.getX(), target.getY());
            if (distance <= CommonUtil.UNIT_SIZE) {
                switch (orientation) {
                    case UP:
                        if (tank.getY() > target.getY()) {
                            return true;
                        }
                        break;
                    case DOWN:
                        if (tank.getY() < target.getY()) {
                            return true;
                        }
                        break;
                    case LEFT:
                        if (tank.getX() > target.getX()) {
                            return true;
                        }
                        break;
                    case RIGHT:
                        if (tank.getX() < target.getX()) {
                            return true;
                        }
                        break;
                    default:
                        break;
                }
            }
        }
        return false;
    }

    private boolean collideWithMap(Point point) {
        String key = CommonUtil.generateGridKey(point.x, point.y);
        if (!getMapBo().getUnitMap().containsKey(key)) {
            return false;
        }

        return getMapBo().getUnitMap().get(key) != MapUnitType.GRASS;
    }

    private List<Point> generateCorners(TankBo tank, OrientationType orientation) {
        int x = (int) tank.getX();
        int y = (int) tank.getY();
        int size = CommonUtil.UNIT_SIZE;
        int halfLite = size / 2 - 1;

        //获取前方的两个角的坐标（顺时针获取）
        Point corner1 = new Point();
        Point corner2 = new Point();
        switch (orientation) {
            case UP:
                y -= tank.getType().getSpeed();
                corner1.x = x - halfLite;
                corner1.y = y - halfLite;
                corner2.x = x + halfLite;
                corner2.y = y - halfLite;
                break;
            case DOWN:
                y += tank.getType().getSpeed();
                corner1.x = x + halfLite;
                corner1.y = y + halfLite;
                corner2.x = x - halfLite;
                corner2.y = y + halfLite;
                break;
            case LEFT:
                x -= tank.getType().getSpeed();
                corner1.x = x - halfLite;
                corner1.y = y + halfLite;
                corner2.x = x - halfLite;
                corner2.y = y - halfLite;
                break;
            case RIGHT:
                x += tank.getType().getSpeed();
                corner1.x = x + halfLite;
                corner1.y = y - halfLite;
                corner2.x = x + halfLite;
                corner2.y = y + halfLite;
                break;
            default:
                break;
        }
        List<Point> corners = new ArrayList<>();
        corners.add(corner1);
        corners.add(corner2);
        return corners;
    }

    private boolean catchItem(TankBo tankBo) {
        if (!canCatchItem(tankBo)) {
            return false;
        }

        List<Point> corners = generateCorners(tankBo, tankBo.getOrientationType());
        for (Point corner : corners) {
            String key = CommonUtil.generateGridKey(corner.x, corner.y);
            if (!itemMap.containsKey(key)) {
                continue;
            }

            ItemBo itemBo = itemMap.get(key);
            return catchItem(tankBo, itemBo);
        }
        return false;
    }

    private boolean canCatchItem(TankBo tankBo) {
        return getRoomType() != RoomType.PVE || tankBo.getTankId().equals(tankBo.getUserId()) || hardMode;
    }

    private boolean catchItem(TankBo tankBo, ItemBo itemBo) {
        switch (itemBo.getType()) {
            case STAR:
                if (!tankBo.levelUp()) {
                    return false;
                }
                itemMap.remove(itemBo.getPosKey());
                sendMessageToRoom(itemBo.getId(), MessageType.REMOVE_ITEM);
                return true;
            case RED_STAR:
                if (!tankBo.levelUpToTop()) {
                    return false;
                }
                itemMap.remove(itemBo.getPosKey());
                sendMessageToRoom(itemBo.getId(), MessageType.REMOVE_ITEM);
                return true;
            case SHIELD:
                tankBo.setShieldTimeout(tankBo.getShieldTimeout() + DEFAULT_SHIELD_TIME);
                itemMap.remove(itemBo.getPosKey());
                sendMessageToRoom(itemBo.getId(), MessageType.REMOVE_ITEM);
                return true;
            case LIFE:
                addLife(tankBo);
                itemMap.remove(itemBo.getPosKey());
                sendMessageToRoom(itemBo.getId(), MessageType.REMOVE_ITEM);
                return false;
            case KING:
                kingShield(tankBo.getTeamType());
                itemMap.remove(itemBo.getPosKey());
                sendMessageToRoom(itemBo.getId(), MessageType.REMOVE_ITEM);
                return false;
            case BULLET:
                tankBo.setBulletCount(tankBo.getBulletCount() + 1);
                tankBo.setMaxBulletCount(tankBo.getMaxBulletCount() + 1);
                itemMap.remove(itemBo.getPosKey());
                sendMessageToRoom(itemBo.getId(), MessageType.REMOVE_ITEM);
                return true;
            case GHOST:
                if (tankBo.isHasGhost()) {
                    return false;
                }
                tankBo.setHasGhost(true);
                itemMap.remove(itemBo.getPosKey());
                sendMessageToRoom(itemBo.getId(), MessageType.REMOVE_ITEM);
                return true;
            case CLOCK:
                clockEvent(tankBo.getTeamType());
                itemMap.remove(itemBo.getPosKey());
                sendMessageToRoom(itemBo.getId(), MessageType.REMOVE_ITEM);
                return false;
            default:
                return false;
        }
    }

    private void clockEvent(TeamType teamType) {
        if (teamType == TeamType.RED) {
            gameStatus.setType(GameStatusType.PAUSE_BLUE);
        } else {
            gameStatus.setType(GameStatusType.PAUSE_RED);
        }
        sendMessageToRoom(gameStatus, MessageType.GAME_STATUS);
        eventList.add(new ClockEvent());
    }

    /**
     * PVE模式下只作用于RED_KING
     *
     * @param teamType
     */
    private void kingShield(TeamType teamType) {
        MapUnitType kingType;
        if (teamType == TeamType.RED || getRoomType() == RoomType.PVE) {
            kingType = MapUnitType.RED_KING;
        } else {
            kingType = MapUnitType.BLUE_KING;
        }

        //寻找king
        List<String> kingKeys = new ArrayList<>();
        Map<String, MapUnitType> unitMap = getMapBo().getUnitMap();
        for (Map.Entry<String, MapUnitType> kv : unitMap.entrySet()) {
            if (kv.getValue() == kingType) {
                kingKeys.add(kv.getKey());
            }
        }

        //寻找要替换的key
        List<String> changeKeys = new ArrayList<>();
        for (String key : kingKeys) {
            Point p = CommonUtil.getGridPointFromKey(key);
            for (int x = p.x - 1; x <= p.x + 1; ++x) {
                for (int y = p.y - 1; y <= p.y + 1; ++y) {
                    if (x < 0 || x >= getMapBo().getMaxGridX()) {
                        continue;
                    }

                    if (y < 0 || y >= getMapBo().getMaxGridY()) {
                        continue;
                    }

                    String changeKey = CommonUtil.generateKey(x, y);
                    MapUnitType changeType = unitMap.getOrDefault(changeKey, MapUnitType.BRICK);
                    if (changeType == MapUnitType.BRICK || changeType == MapUnitType.BROKEN_BRICK) {
                        changeKeys.add(changeKey);
                    }
                }
            }
        }
        if (changeKeys.isEmpty()) {
            return;
        }

        //若是PVE模式则是拆掉基地附近的建筑
        if (getRoomType() == RoomType.PVE && teamType == TeamType.BLUE) {
            for (String changeKey : changeKeys) {
                removeMap(changeKey);
            }
        } else {
            for (String changeKey : changeKeys) {
                unitMap.put(changeKey, MapUnitType.IRON);
            }
            sendMessageToRoom(getMapBo().toDtoWithKeys(changeKeys), MessageType.MAP);
            this.eventList.add(new IronKingEvent(changeKeys));
        }

    }

    private void addLife(TankBo tankBo) {
        List<StringCountDto> life = getLifeMap(tankBo.getTeamType());

        if (!life.isEmpty()) {
            life.get(0).addValue(1);
        } else {
            life.add(new StringCountDto(tankBo.getType().getTypeId(), 1));

            //将观看模式的用户加入战场
            for (Map.Entry<String, UserBo> kv : userMap.entrySet()) {
                UserBo userBo = kv.getValue();
                if (isBot(userBo.getTeamType())) {
                    continue;
                }

                if (userBo.getTeamType() != tankBo.getTeamType()) {
                    continue;
                }

                if (tankMap.containsKey(userBo.getUsername())) {
                    continue;
                }

                this.eventList.add(new CreateTankEvent(userBo, 60 * 3));
                break;
            }
        }

        sendMessageToRoom(getMapBo().convertLifeCountToDto(), MessageType.MAP);
    }

    private boolean collideWithAll(BulletBo bullet) {
        if (bullet.getX() < 0 || bullet.getY() < 0 || bullet.getX() >= getMapBo().getWidth() || bullet.getY() >= getMapBo().getHeight()) {
            //超出范围
            this.removeBulletIds.add(bullet.getId());
            return true;
        }

        //和地图场景碰撞检测
        String key = CommonUtil.generateGridKey(bullet.getX(), bullet.getY());
        if (collideForBullet(getMapBo().getUnitMap().get(key))) {
            this.removeBulletIds.add(bullet.getId());
            processMapWhenCatchAmmo(key, bullet);
            return true;
        }

        //和坦克碰撞检测
        TankBo tankBo = collideWithTanks(bullet);
        if (tankBo != null) {
            this.removeBulletIds.add(bullet.getId());
            if (!tankBo.hasShield()) {
                if (tankBo.levelDown()) {
                    sendTankToRoom(tankBo);
                } else {
                    removeTankFromTankId(tankBo.getTankId());
                }
            }
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
        double minDistance = (CommonUtil.UNIT_SIZE + CommonUtil.AMMO_SIZE) / 2.0;
        for (Map.Entry<String, TankBo> kv : this.tankMap.entrySet()) {
            TankBo tankBo = kv.getValue();
            //队伍相同，不检测
            if (tankBo.getTeamType() == bulletBo.getTeamType()) {
                continue;
            }
            double distance = Point.distance(tankBo.getX(), tankBo.getY(), bulletBo.getX(), bulletBo.getY());
            if (distance <= minDistance) {
                return tankBo;
            }
        }
        return null;
    }

    private boolean collideWithBullets(BulletBo ammo) {
        for (Map.Entry<String, BulletBo> kv : this.bulletMap.entrySet()) {
            BulletBo target = kv.getValue();
            if (target.getTeamType() == ammo.getTeamType()) {
                continue;
            }

            double distance = Point.distance(ammo.getX(), ammo.getY(), target.getX(), target.getY());
            if (distance <= CommonUtil.AMMO_SIZE) {
                this.removeBulletIds.add(ammo.getId());
                this.removeBulletIds.add(target.getId());
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

        if (mapUnitType == MapUnitType.RED_KING && bulletBo.getTeamType() != TeamType.RED) {
            removeMap(key);
            processGameOver(TeamType.BLUE);
            return;
        }

        if (mapUnitType == MapUnitType.BLUE_KING && bulletBo.getTeamType() != TeamType.BLUE) {
            removeMap(key);
            processGameOver(TeamType.RED);
        }
    }

    /**
     * 续关
     */
    public void restartPve(UserBo userBo) {
        if (gameStatus.getType() != GameStatusType.LOSE) {
            throw new CustomException("房间状态异常, 操作失败");
        }
        if (!mapManger.reload()) {
            throw new CustomException("地图读取异常, 操作失败");
        }

        sendMessageToRoom(String.format("%s 选择了续关,游戏将在5秒后重新开始...", userBo.getUsername()), MessageType.SYSTEM_MESSAGE);

        //重置总分
        this.scoreBo.setTotalScore(0);

        gameStatus.setType(GameStatusType.PAUSE);
        init();
        processNextMapEvent(5, "重新开始");
    }

    private void processGameOver(TeamType winTeam) {
        if (getRoomType() == RoomType.PVE && !processGameOverPve(winTeam)) {
            return;
        } else if (getRoomType() != RoomType.PVE && !processGameOverPvp(winTeam)) {
            return;
        }

        init();
        processNextMapEvent(10, "进入下一关");
    }

    private void processNextMapEvent(int loadSeconds, String tips) {
        for (int i = 1; i <= loadSeconds; ++i) {
            String content = String.format("%d秒后%s...", i, tips);
            MessageEvent messageEvent = new MessageEvent(content, MessageType.SYSTEM_MESSAGE);
            messageEvent.setTimeout((loadSeconds - i) * 60);
            this.eventList.add(messageEvent);
        }

        int frames = loadSeconds * 60;

        //更改关卡信息
        MessageEvent changeTitle = new MessageEvent(getMapBo().convertMapIdToDto(), MessageType.MAP);
        changeTitle.setTimeout(frames++);
        this.eventList.add(changeTitle);

        //清空地图
        MessageEvent cleanEvent = new MessageEvent(null, MessageType.CLEAR_MAP);
        cleanEvent.setTimeout(frames++);
        this.eventList.add(cleanEvent);

        //加载地图
        LoadMapEvent loadEvent = new LoadMapEvent();
        loadEvent.setTimeout(frames);
        this.eventList.add(loadEvent);
    }

    private boolean processGameOverPve(TeamType winTeam) {
        if (winTeam == TeamType.RED) {
            this.scoreBo.addWinScore(this.hardMode);
            this.scoreBo.addTotalScore();
            gameStatus.setScore(this.scoreBo.getTotalScore());
            gameStatus.setStar(mapStarService.getStarCount(this.scoreBo.getDeadCount()));
            gameStatus.setRank(userService.getRank(this.scoreBo.getTotalScore()));
            saveStar();

            int newMapId = getMapId();
            int newSubId = getSubId();
            if (newSubId < 5) {
                ++newSubId;
            } else {
                ++newMapId;
                newSubId = 1;
                saveStage();
            }
            int saveLife = saveTankType();
            if (!mapManger.loadNextMapPve(saveLife, newMapId, newSubId)) {
                gameStatus.setType(GameStatusType.WIN);
                userService.saveRankForMultiplePlayers(this.creator, gameStatus);
            } else {
                gameStatus.setType(GameStatusType.END);
            }
        } else {
            this.scoreBo.addTotalScore();
            gameStatus.setScore(this.scoreBo.getTotalScore());
            gameStatus.setRank(userService.getRank(this.scoreBo.getTotalScore()));
            gameStatus.setType(GameStatusType.LOSE);
            userService.saveRankForMultiplePlayers(this.creator, gameStatus);
        }
        sendMessageToRoom(gameStatus, MessageType.GAME_STATUS);

        return gameStatus.getType() == GameStatusType.END;
    }

    /**
     * 保持通关记录
     */
    private void saveStage() {
        UserRecord userRecord = creator.getUserRecord();
        if (userRecord == null) {
            return;
        }

        if (hardMode) {
            if (userRecord.getHardStage() == getMapId()) {
                userRecord.setHardStage(getMapId() + 1);
            }
        } else {
            if (userRecord.getStage() == getMapId()) {
                userRecord.setStage(getMapId() + 1);
                if (userRecord.getHardStage() == 0) {
                    userRecord.setHardStage(1);
                }
            }
        }
        userRecord.update();
    }

    private void saveStar() {
        StarDto starDto = new StarDto();
        starDto.setHardMode(hardMode);
        starDto.setMapId(getMapId());
        starDto.setSubId(getSubId());
        starDto.setStar(gameStatus.getStar());
        for (Map.Entry<String, UserBo> kv : userMap.entrySet()) {
            UserBo user = kv.getValue();
            if (StringUtils.isEmpty(user.getUserId())) {
                continue;
            }
            starDto.setUserId(user.getUserId());
            userService.saveStarForMultiplePlayers(starDto);
        }
    }

    private boolean processGameOverPvp(TeamType winTeam) {
        userMap.forEach((key, value) -> {
            if (value.getTeamType() == winTeam) {
                sendMessageToUser(new GameStatusDto(GameStatusType.END), MessageType.GAME_STATUS, value.getUsername());
            } else {
                sendMessageToUser(new GameStatusDto(GameStatusType.LOSE_PVP), MessageType.GAME_STATUS, value.getUsername());
            }
        });

        if (!mapManger.loadRandomMapPvp()) {
            gameStatus.setType(GameStatusType.WIN);
        } else {
            gameStatus.setType(GameStatusType.END);
        }
        return gameStatus.getType() == GameStatusType.END;
    }

    private void changeMap(String key, MapUnitType type) {
        getMapBo().getUnitMap().put(key, type);
        sendMessageToRoom(MapDto.convert(key, type), MessageType.MAP);
    }

    private void removeMap(String key) {
        getMapBo().getUnitMap().remove(key);
        sendMessageToRoom(key, MessageType.REMOVE_MAP);
    }

    private boolean collideForBullet(MapUnitType mapUnitType) {
        if (mapUnitType == null) {
            return false;
        }
        return mapUnitType != MapUnitType.GRASS && mapUnitType != MapUnitType.RIVER;
    }

    @Override
    void removeTankExtension(TankBo tankBo) {
        updateGameScore(tankBo);

        //check status
        if (checkGameStatusAfterTankBomb()) {
            return;
        }

        sendTankBombMessage(tankBo);

        //recreate
        UserBo userBo = this.userMap.get(tankBo.getUserId());
        if (userBo == null && this.botMap.containsKey(tankBo.getUserId())) {
            userBo = this.botMap.get(tankBo.getUserId()).getBotUser();
        }
        if (userBo != null) {
            this.eventList.add(new CreateTankEvent(userBo, tankBo.getTankId(), 60 * 3));
        }
    }

    private void updateGameScore(TankBo tankBo) {
        if (getRoomType() != RoomType.PVE) {
            return;
        }

        if (tankBo.getTeamType() == TeamType.RED) {
            this.scoreBo.addScoreForPlayerBoom();
        } else {
            this.scoreBo.addScoreForComBoom();
        }
    }

    private boolean checkGameStatusAfterTankBomb() {
        //游戏已经暂停
        if (gameStatus.isPause()) {
            return true;
        }

        //先判断候补
        boolean redAlive = !getMapBo().getPlayerLife().isEmpty();
        boolean blueAlive = !getMapBo().getComputerLife().isEmpty();

        //再判断在场
        for (Map.Entry<String, TankBo> kv : tankMap.entrySet()) {
            if (kv.getValue().getTeamType() == TeamType.RED) {
                redAlive = true;
            } else {
                blueAlive = true;
            }

            if (redAlive && blueAlive) {
                break;
            }
        }

        if (!redAlive) {
            processGameOver(TeamType.BLUE);
            return true;
        }
        if (!blueAlive) {
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

    public void addBot(BaseBotBo bot) {
        bot.setStage(this);
        botMap.put(bot.getId(), bot);
        addPlayerLifeForNewComer(bot.getTeamType());

        createTankForUser(bot.getBotUser(), 60 * 3);
    }

    public void addUser(UserBo userBo) {
        userMap.put(userBo.getUsername(), userBo);
        userBo.setRoomId(this.roomId);
        sendStatusAndMessage(userBo, false);

        addPlayerLifeForNewComer(userBo.getTeamType());
        initItemPool();

        //发送场景信息
        sendMessageToUser(getMapBo().toDto(), MessageType.MAP, userBo.getUsername());
        sendMessageToUser(getTankList(), MessageType.TANKS, userBo.getUsername());
        sendMessageToUser(getBulletList(), MessageType.BULLET, userBo.getUsername());
        sendMessageToUser(getItemPool(), MessageType.ITEM, userBo.getUsername());
        sendMessageToUser(gameStatus, MessageType.GAME_STATUS, userBo.getUsername());

        createTankForUser(userBo, 60 * 3);
    }

    /**
     * 防止新用户进来没有生命的情况
     */
    private void addPlayerLifeForNewComer(TeamType teamType) {
        if (getRoomType() != RoomType.PVE) {
            return;
        }

        if (teamType != TeamType.RED) {
            return;
        }

        if (!getMapBo().getPlayerLife().isEmpty()) {
            return;
        }

        getMapBo().addPlayerLife(1);
    }

    private void createTankForUser(UserBo userBo, int timeoutForPlayer) {
        if (isBot(userBo.getTeamType())) {
            int count = getMapBo().getComputerStartCount();
            for (int i = 0; i < count; ++i) {
                this.eventList.add(new CreateTankEvent(userBo, CommonUtil.getId(), 60 * random.nextInt(count)));
            }
            return;
        }

        this.eventList.add(new CreateTankEvent(userBo, timeoutForPlayer));
    }

    private void addNewTank(UserBo userBo, String tankId) {
        if (userBo.getTeamType() == TeamType.VIEW) {
            return;
        }

        List<StringCountDto> lifeMap = getLifeMap(userBo.getTeamType());
        if (lifeMap.isEmpty()) {
            if (!isBot(userBo.getTeamType())) {
                sendMessageToRoom(String.format("没有剩余生命值, 玩家 %s 将变成观看模式", userBo.getUsername()), MessageType.SYSTEM_MESSAGE);
            }
            return;
        }

        TankBo tankBo = new TankBo();
        tankBo.setTankId(tankId);
        tankBo.setUserId(userBo.getUsername());
        tankBo.setTeamType(userBo.getTeamType());
        setStartPoint(tankBo);
        if (!tankBo.isBot()) {
            tankBo.setShieldTimeout(DEFAULT_SHIELD_TIME_FOR_NEW_TANK);
        }

        //复制并恢复玩家保存的状态
        TankTypeDto initType = getTankType(lifeMap, userBo);
        TankBo saveTank = this.tankStatusSaveMap.get(userBo.getUsername());
        if (saveTank == null) {
            tankBo.setType(initType);
            tankBo.setBulletCount(tankBo.getType().getAmmoMaxCount());
            tankBo.setMaxBulletCount(tankBo.getType().getAmmoMaxCount());
        } else {
            this.tankStatusSaveMap.remove(userBo.getUsername());
            tankBo.setType(saveTank.getType());
            tankBo.setBulletCount(saveTank.getMaxBulletCount());
            tankBo.setMaxBulletCount(saveTank.getMaxBulletCount());
            tankBo.setHasGhost(saveTank.isHasGhost());
        }

        tankMap.put(tankBo.getTankId(), tankBo);
        sendTankToRoom(tankBo);
    }

    /**
     * 根据队伍获得类型，并且更新life
     *
     * @param lifeMap
     * @return
     */
    private TankTypeDto getTankType(List<StringCountDto> lifeMap, UserBo userBo) {
        StringCountDto pair = lifeMap.get(0);
        int lastCount = pair.getValue() - 1;
        if (lastCount == 0) {
            lifeMap.remove(0);
        } else {
            pair.setValue(lastCount);
        }
        sendMessageToRoom(getMapBo().convertLifeCountToDto(), MessageType.MAP);
        String tankType = pair.getKey();
        if (isBot(userBo.getTeamType())) {
            return TankTypeDto.getTankType(tankType);
        }
        if (userBo.getUserRecord() == null) {
            return TankTypeDto.getTankType(tankType);
        }
        UserRecord userRecord = userBo.getUserRecord();
        if (!StringUtils.isEmpty(userRecord.getTankType()) &&
                userRecord.getTankTypeExpired() != null &&
                userRecord.getTankTypeExpired().after(TimeUtil.now())) {
            tankType = userRecord.getTankType();
        }
        return TankTypeDto.getTankType(tankType);
    }

    private List<StringCountDto> getLifeMap(TeamType teamType) {
        if (teamType == TeamType.RED) {
            return getMapBo().getPlayerLife();
        } else {
            return getMapBo().getComputerLife();
        }
    }

    private List<ItemDto> getTankList() {
        List<ItemDto> tankDtoList = new ArrayList<>();
        for (Map.Entry<String, TankBo> kv : tankMap.entrySet()) {
            tankDtoList.add(kv.getValue().toDto());
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

    private List<ItemDto> getItemPool() {
        List<ItemDto> itemDtoList = new ArrayList<>();
        for (Map.Entry<String, ItemBo> kv : itemMap.entrySet()) {
            itemDtoList.add(kv.getValue().toDto());
        }
        return itemDtoList;
    }

    private void setStartPoint(TankBo tankBo) {
        String posStr;
        if (tankBo.getTeamType() == TeamType.RED) {
            posStr = getMapBo().getPlayerStartPoints().get(random.nextInt(getMapBo().getPlayerStartPoints().size()));
        } else {
            posStr = getMapBo().getComputerStartPoints().get(random.nextInt(getMapBo().getComputerStartPoints().size()));
        }
        Point point = CommonUtil.getPointFromKey(posStr);
        tankBo.setX(point.getX());
        tankBo.setY(point.getY());
    }

    private boolean isBot(TeamType teamType) {
        if (getRoomType() == RoomType.EVE) {
            return true;
        }
        return getRoomType() == RoomType.PVE && teamType == TeamType.BLUE;
    }
}
