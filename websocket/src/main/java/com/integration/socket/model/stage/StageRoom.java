package com.integration.socket.model.stage;

import com.integration.socket.model.ActionType;
import com.integration.socket.model.MapUnitType;
import com.integration.socket.model.MessageType;
import com.integration.socket.model.OrientationType;
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

    private ConcurrentHashMap<String, List<String>> gridTankMap = new ConcurrentHashMap<>();

    private ConcurrentHashMap<String, List<String>> gridBulletMap = new ConcurrentHashMap<>();

    /**
     * 要删除的子弹列表，每帧刷新
     */
    private List<String> removeBulletIds = new ArrayList<>();

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
        for (Map.Entry<String, TankBo> kv : tankMap.entrySet()) {
            TankBo tankBo = kv.getValue();
            updateTank(tankBo);
        }

        for (Map.Entry<String, BulletBo> kv : bulletMap.entrySet()) {
            updateBullet(kv.getValue());
        }
        removeBullets();
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
        String newStart = bullet.generateStartGridKey();
        if (newStart.equals(bullet.getStartGridKey())) {
            return;
        }

        removeToGridBulletMap(bullet, bullet.getStartGridKey());
        bullet.setStartGridKey(newStart);

        //newStartKey must equal endKey
        String newEnd = bullet.generateEndGridKey();
        bullet.setEndGridKey(newEnd);
        insertToGridBulletMap(bullet, newEnd);
    }

    /**
     * 内部会出现四种状态
     * 停止 & 不需要更新
     * 停止 & 需要更新
     * 移动 & 需要更新
     * 移动 & 不需要更新
     * @param tankBo
     */
    private void updateTank(TankBo tankBo) {
        //先排除停止 & 不需要更新的状态
        if (tankBo.getActionType() == ActionType.STOP && !tankBo.hasDifferentCache()) {
            return;
        }

        //停止 & 需要更新
        if (tankBo.getActionType() == ActionType.STOP) {
            updateInCache(tankBo);
            return;
        }


        double speed = tankBo.getType().getSpeed();
        double distance = tankBo.distanceToEndGrid();
        boolean reachDestination = distance <= speed;

        //没到目的地，不更新
        if (!reachDestination) {
            //只和tank做碰撞检测
            if (collideWithTanks(tankBo)) {
                tankForceStop(tankBo);
            } else {
                tankBo.run(speed);
            }
            return;
        }

        //先更新start key
        String startKey = tankBo.getStartGridKey();
        removeToGridTankMap(tankBo, startKey);
        tankBo.setStartGridKey(tankBo.getEndGridKey());

        //碰撞检测,滤掉走不通的情况
        Point grid = getGrid(tankBo);
        if (collideWithAll(grid.x, grid.y, tankBo)) {
            tankForceStop(tankBo);
            return;
        }

        // 还剩两种情况
        // 1.到了目的地 & 要更新
        // 2.到了目的地 & 不更新

        if (tankBo.hasDifferentCache()) {
            //先移动到目的地再更新状态
            tankBo.run(distance);
            updateInCache(tankBo);
            return;
        }

        //最后情况：到了目的地 & 不更新状态
        //只更新新目的地
        tankBo.run(speed);
        String endKey = CommonUtil.generateKey(grid.x, grid.y);
        tankBo.setEndGridKey(endKey);
        insertToGridTankMap(tankBo, endKey);
    }

    private void tankForceStop(TankBo tankBo) {
        if (!tankBo.getStartGridKey().equals(tankBo.getEndGridKey())) {
            removeToGridTankMap(tankBo, tankBo.getEndGridKey());
            tankBo.setEndGridKey(tankBo.getStartGridKey());
        }
        tankBo.setActionType(ActionType.STOP);
        sendTankToRoom(tankBo);
    }

    private void updateInCache(TankBo tankBo) {
        if (!tankBo.hasDifferentCache()) {
            return;
        }

        Point grid = getGrid(tankBo);
        if (tankBo.getActionCache() == ActionType.RUN && collideWithAll(grid.x, grid.y, tankBo)) {
            //有障碍，停止, 再递归判断是否一致
            tankBo.setActionCache(ActionType.STOP);
            updateInCache(tankBo);
            return;
        }

        //代码走到这里有几种可能
        //1. 停止 & 更新移动
        //2. 停止 & 更新停止(碰撞检测后)
        //3. 移动 & 更新移动
        //4. 移动 & 更新停止(主动停止或碰撞检测后都有可能)
        tankBo.setActionType(tankBo.getActionCache());
        tankBo.setOrientationType(tankBo.getOrientationCache());
        if (tankBo.getActionType() == ActionType.RUN) {
            //开始跑，更新目标
            String endKey = CommonUtil.generateKey(grid.x, grid.y);
            tankBo.setEndGridKey(endKey);
            insertToGridTankMap(tankBo, endKey);
        }
        sendTankToRoom(tankBo);
    }

    private Point getGrid(TankBo tankBo) {
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
        }
        return new Point(gridX, gridY);
    }

    private boolean collideWithAll(int gridX, int gridY, TankBo tankBo) {
        if (gridX < 0 || gridY < 0 || gridX >= mapBo.getMaxGridX() || gridY >= mapBo.getMaxGridY()) {
            //超出范围，停止
            return true;
        } else {
            String goalKey = CommonUtil.generateKey(gridX, gridY);
            if (collideForTank(mapBo.getUnitMap().get(goalKey))) {
                //有障碍物，停止
                return true;
            } else {
                return collideWithTanks(tankBo);
            }
        }
    }

    private boolean collideWithAll(BulletBo bullet) {
        if (bullet.getX() <= 0 || bullet.getY() < 0 || bullet.getX() >= mapBo.getWidth() || bullet.getY() >= mapBo.getHeight()) {
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
            removeTankFromTankId(tankBo.getTankId());
            return true;
        }

        //和子弹碰撞检测
        return collideWithBullets(bullet);
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

    private boolean collideWithTanks(TankBo tankBo) {
        String startKey = tankBo.getStartGridKey();
        if (collideWithTanks(tankBo, startKey)) {
            return true;
        }

        if (tankBo.getEndGridKey() != null && !tankBo.getEndGridKey().equals(startKey)) {
            return collideWithTanks(tankBo, tankBo.getEndGridKey());
        }
        return false;
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
        switch (tank1.getOrientationCache()) {
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
        removeToGridTankMap(tankBo, tankBo.getStartGridKey());
        removeToGridTankMap(tankBo, tankBo.getEndGridKey());
    }

    @Override
    public void removeUser(String username) {
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

    public void addUser(UserBo userBo, TeamType teamType) {
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
        sendMessageToRoom(getTankList(), MessageType.TANKS);
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

    private void setStartPoint(TankBo tankBo) {
        String posStr;
        if (tankBo.getTeamType() == TeamType.RED) {
            posStr = mapBo.getPlayerStartPoints().get(random.nextInt(mapBo.getPlayerStartPoints().size()));
        } else {
            posStr = mapBo.getComputerStartPoints().get(random.nextInt(mapBo.getComputerStartPoints().size()));
        }
        tankBo.setStartGridKey(posStr);
        tankBo.setEndGridKey(posStr);
        Point point = CommonUtil.getPointFromKey(posStr);
        tankBo.setX(point.getX());
        tankBo.setY(point.getY());
        insertToGridTankMap(tankBo, tankBo.getStartGridKey());
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

    @Override
    void processTankFireExtension(BulletBo bullet) {
        String startKey = bullet.generateStartGridKey();
        bullet.setStartGridKey(startKey);
        insertToGridBulletMap(bullet, startKey);

        String endKey = bullet.generateEndGridKey();
        bullet.setEndGridKey(endKey);
        insertToGridBulletMap(bullet, endKey);
    }
}
