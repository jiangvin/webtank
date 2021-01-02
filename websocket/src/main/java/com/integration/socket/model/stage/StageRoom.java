package com.integration.socket.model.stage;

import com.integration.dto.map.ActionType;
import com.integration.dto.map.ItemDto;
import com.integration.dto.map.MapDto;
import com.integration.dto.map.MapUnitType;
import com.integration.dto.map.OrientationType;
import com.integration.dto.message.MessageType;
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
import com.integration.socket.model.bo.PointBo;
import com.integration.socket.model.bo.ScoreBo;
import com.integration.socket.model.bo.TankBo;
import com.integration.socket.model.bo.UserBo;
import com.integration.socket.model.bot.BaseBotBo;
import com.integration.socket.model.dto.StringCountDto;
import com.integration.socket.service.MapStarService;
import com.integration.socket.service.MessageService;
import com.integration.socket.service.UserService;
import com.integration.util.CommonUtil;
import com.integration.util.model.CustomException;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.awt.Point;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/4
 */

@Slf4j
public class StageRoom extends BaseStage {

    private static final int DEFAULT_SHIELD_TIME = 20 * 60;

    Map<String, ItemBo> itemMap = new ConcurrentHashMap<>();

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
    Map<String, BaseBotBo> botMap = new ConcurrentHashMap<>();

    /**
     * 在通关后记录玩家属性
     */
    Map<String, TankBo> tankStatusSaveMap = new ConcurrentHashMap<>();

    @Getter
    private String roomId;

    boolean hardMode;

    @Getter
    UserBo creator;

    MapMangerBo mapManger;

    private EventManager eventManager;

    private RoomTypeManager roomTypeManager;

    /**
     * 计分相关
     */
    ScoreBo scoreBo = new ScoreBo();
    UserService userService;
    MapStarService mapStarService;

    /**
     * 道具池
     */
    List<ItemType> itemTypePool = new ArrayList<>();

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
        this.eventManager = new EventManager(this);
        this.roomTypeManager = new RoomTypeManager(this);
        init();
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
        this.syncTankList.clear();

        this.roomTypeManager.initItemPool();
        this.scoreBo.init();
        this.gameStatus.init();
        this.eventManager.init();
    }

    int getMapId() {
        return mapManger.getMapId();
    }

    int getSubId() {
        return mapManger.getSubId();
    }

    RoomType getRoomType() {
        return mapManger.getRoomType();
    }

    MapBo getMapBo() {
        return mapManger.getMapBo();
    }

    @Override
    public void update() {
        eventManager.update();

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
        List<PointBo> corners = generateCorners(tank, orientation);
        for (PointBo corner : corners) {
            CollideType result = canPass(corner, tank.isHasGhost());
            if (result != CollideType.COLLIDE_NONE) {
                return result;
            }
        }
        return CollideType.COLLIDE_NONE;
    }

    private CollideType canPass(PointBo point, boolean hasGhost) {
        if (point.getX() < 0 || point.getY() < 0 || point.getX() >= getMapBo().getWidth() || point.getY() >= getMapBo().getHeight()) {
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

    private boolean collideWithMap(PointBo point) {
        String key = CommonUtil.generateGridKey(point.getX(), point.getY());
        if (!getMapBo().getUnitMap().containsKey(key)) {
            return false;
        }

        return getMapBo().getUnitMap().get(key) != MapUnitType.GRASS;
    }

    private List<PointBo> generateCorners(TankBo tank, OrientationType orientation) {
        double x = tank.getX();
        double y = tank.getY();
        int size = CommonUtil.UNIT_SIZE;
        int halfLite = size / 2 - 1;

        //获取前方的两个角的坐标（顺时针获取）
        PointBo corner1 = new PointBo();
        PointBo corner2 = new PointBo();
        switch (orientation) {
            case UP:
                y -= tank.getType().getSpeed();
                corner1.setX(x - halfLite);
                corner1.setY(y - halfLite);
                corner2.setX(x + halfLite);
                corner2.setY(y - halfLite);
                break;
            case DOWN:
                y += tank.getType().getSpeed();
                corner1.setX(x + halfLite);
                corner1.setY(y + halfLite);
                corner2.setX(x - halfLite);
                corner2.setY(y + halfLite);
                break;
            case LEFT:
                x -= tank.getType().getSpeed();
                corner1.setX(x - halfLite);
                corner1.setY(y + halfLite);
                corner2.setX(x - halfLite);
                corner2.setY(y - halfLite);
                break;
            case RIGHT:
                x += tank.getType().getSpeed();
                corner1.setX(x + halfLite);
                corner1.setY(y - halfLite);
                corner2.setX(x + halfLite);
                corner2.setY(y + halfLite);
                break;
            default:
                break;
        }
        List<PointBo> corners = new ArrayList<>();
        corners.add(corner1);
        corners.add(corner2);
        return corners;
    }

    private boolean catchItem(TankBo tankBo) {
        if (!canCatchItem(tankBo)) {
            return false;
        }

        List<PointBo> corners = generateCorners(tankBo, tankBo.getOrientationType());
        for (PointBo corner : corners) {
            String key = CommonUtil.generateGridKey(corner.getX(), corner.getY());
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
                eventManager.createKingShieldEvent(tankBo.getTeamType());
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
                eventManager.createClockEvent(tankBo.getTeamType());
                itemMap.remove(itemBo.getPosKey());
                sendMessageToRoom(itemBo.getId(), MessageType.REMOVE_ITEM);
                return false;
            default:
                return false;
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

                eventManager.createTankEvent(userBo);
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

        sendMessageToRoom(String.format("%s 选择了重玩,游戏将在5秒后重新开始...", userBo.getUsername()), MessageType.SYSTEM_MESSAGE);

        //重置总分
        this.scoreBo.setTotalScore(0);

        gameStatus.setType(GameStatusType.PAUSE);
        init();
        processNextMapEvent(5, "重新开始");
    }

    private void processGameOver(TeamType winTeam) {
        if (!roomTypeManager.processGameOver(winTeam)) {
            return;
        }
        init();
        processNextMapEvent(10, "进入下一关");
    }

    private void processNextMapEvent(int loadSeconds, String tips) {
        for (int i = 1; i <= loadSeconds; ++i) {
            String content = String.format("%d秒后%s...", i, tips);
            eventManager.createMessageEvent(content, MessageType.SYSTEM_MESSAGE, (loadSeconds - i) * 60);
        }
        int frames = loadSeconds * 60;

        //更改关卡信息
        eventManager.createMessageEvent(getMapBo().convertMapIdToDto(), MessageType.MAP, frames++);

        //清空地图
        eventManager.createMessageEvent(null, MessageType.CLEAR_MAP, frames++);

        //加载地图
        eventManager.createLoadMapEvent(frames);
    }

    private void changeMap(String key, MapUnitType type) {
        getMapBo().getUnitMap().put(key, type);
        sendMessageToRoom(MapDto.convert(key, type), MessageType.MAP);
    }

    void removeMap(String key) {
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
            eventManager.createTankEvent(userBo, tankBo.getTankId());
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
        return String.format("%s[%s]", userBo.getUsername(), roomTypeManager.getTeamStr(userBo.getTeamType()));
    }

    public void addBot(BaseBotBo bot) {
        bot.setStage(this);
        botMap.put(bot.getId(), bot);
        addPlayerLifeForNewComer(bot.getTeamType());
        eventManager.createTankEvent(bot.getBotUser());
    }

    public void addUser(UserBo userBo) {
        userMap.put(userBo.getUsername(), userBo);
        userBo.setRoomId(this.roomId);
        sendStatusAndMessage(userBo, false);

        addPlayerLifeForNewComer(userBo.getTeamType());
        roomTypeManager.initItemPool();

        //发送场景信息
        sendMessageToUser(getMapBo().toDto(), MessageType.MAP, userBo.getUsername());
        sendMessageToUser(getTankList(), MessageType.TANKS, userBo.getUsername());
        sendMessageToUser(getBulletList(), MessageType.BULLET, userBo.getUsername());
        sendMessageToUser(getItemPool(), MessageType.ITEM, userBo.getUsername());
        sendMessageToUser(gameStatus, MessageType.GAME_STATUS, userBo.getUsername());

        eventManager.createTankEvent(userBo);
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

    List<StringCountDto> getLifeMap(TeamType teamType) {
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

    boolean isBot(TeamType teamType) {
        if (getRoomType() == RoomType.EVE) {
            return true;
        }
        return getRoomType() == RoomType.PVE && teamType == TeamType.BLUE;
    }
}
