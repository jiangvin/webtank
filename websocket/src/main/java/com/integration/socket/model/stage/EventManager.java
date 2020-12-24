package com.integration.socket.model.stage;

import com.integration.dto.map.MapUnitType;
import com.integration.dto.message.MessageType;
import com.integration.dto.room.GameStatusType;
import com.integration.dto.room.RoomType;
import com.integration.dto.room.TeamType;
import com.integration.socket.model.ItemType;
import com.integration.socket.model.bo.ItemBo;
import com.integration.socket.model.bo.MapBo;
import com.integration.socket.model.bo.TankBo;
import com.integration.socket.model.bo.UserBo;
import com.integration.socket.model.bot.BaseBotBo;
import com.integration.socket.model.dto.StringCountDto;
import com.integration.socket.model.dto.TankTypeDto;
import com.integration.socket.repository.jooq.tables.records.UserRecord;
import com.integration.util.CommonUtil;
import com.integration.util.time.TimeUtil;
import org.springframework.util.StringUtils;

import java.awt.Point;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * @author 蒋文龙(Vin)
 * @description 事件创建器
 * @date 2020/12/24
 */
class EventManager {
    private static final int MAX_ITEM_LIMIT = 3;
    private static final int TRY_TIMES_OF_CREATE_ITEM = 10;
    private static final int DEFAULT_SHIELD_TIME_FOR_NEW_TANK = 3 * 60;

    private StageRoom room;
    private List<BaseEvent> eventList = new ArrayList<>();
    private Random random = new Random();

    EventManager(StageRoom room) {
        this.room = room;
    }

    void update() {
        if (eventList.isEmpty()) {
            return;
        }

        for (int i = 0; i < eventList.size(); ++i) {
            BaseEvent event = eventList.get(i);
            if (event.update()) {
                eventList.remove(i);
                --i;
            }
        }
    }

    void init() {
        this.eventList.clear();
        this.createItemEvent();
    }

    private void createItemEvent() {
        eventList.add(new BaseEvent(15 * 60, 5 * 60) {
            @Override
            void process() {
                if (room.itemMap.size() >= MAX_ITEM_LIMIT) {
                    return;
                }

                ItemType itemType = room.itemTypePool.get(random.nextInt(room.itemTypePool.size()));
                MapBo map = room.getMapBo();
                for (int time = 0; time < TRY_TIMES_OF_CREATE_ITEM; ++time) {
                    Point grid = new Point();
                    grid.x = random.nextInt(map.getMaxGridX());
                    grid.y = random.nextInt(map.getMaxGridY());
                    String key = CommonUtil.generateKey(grid.x, grid.y);
                    if (map.getUnitMap().containsKey(key)) {
                        continue;
                    }
                    if (room.itemMap.containsKey(key)) {
                        continue;
                    }
                    Point pos = CommonUtil.getPointFromKey(key);
                    ItemBo itemBo = new ItemBo(key, pos, CommonUtil.getId(), itemType);
                    room.itemMap.put(key, itemBo);
                    room.sendMessageToRoom(Collections.singletonList(itemBo.toDto()), MessageType.ITEM);
                    break;
                }
            }
        });
    }

    void createClockEvent(TeamType teamType) {
        if (teamType == TeamType.RED) {
            room.gameStatus.setType(GameStatusType.PAUSE_BLUE);
        } else {
            room.gameStatus.setType(GameStatusType.PAUSE_RED);
        }
        room.sendMessageToRoom(room.gameStatus, MessageType.GAME_STATUS);
        eventList.add(new BaseEvent(15 * 60) {
            @Override
            void process() {
                if (room.gameStatus.getType() != GameStatusType.NORMAL) {
                    room.gameStatus.setType(GameStatusType.NORMAL);
                    room.sendMessageToRoom(room.gameStatus, MessageType.GAME_STATUS);
                }
            }
        });
    }

    void createKingShieldEvent(TeamType teamType) {
        MapUnitType kingType;
        if (teamType == TeamType.RED || room.getRoomType() == RoomType.PVE) {
            kingType = MapUnitType.RED_KING;
        } else {
            kingType = MapUnitType.BLUE_KING;
        }

        //寻找king
        List<String> kingKeys = new ArrayList<>();
        Map<String, MapUnitType> unitMap = room.getMapBo().getUnitMap();
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
                    if (x < 0 || x >= room.getMapBo().getMaxGridX()) {
                        continue;
                    }

                    if (y < 0 || y >= room.getMapBo().getMaxGridY()) {
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
        if (room.getRoomType() == RoomType.PVE && teamType == TeamType.BLUE) {
            for (String changeKey : changeKeys) {
                room.removeMap(changeKey);
            }
        } else {
            for (String changeKey : changeKeys) {
                unitMap.put(changeKey, MapUnitType.IRON);
            }
            room.sendMessageToRoom(room.getMapBo().toDtoWithKeys(changeKeys), MessageType.MAP);
            eventList.add(new BaseEvent(30 * 60) {
                @Override
                void process() {
                    for (int i = 0; i < changeKeys.size(); ++i) {
                        String key = changeKeys.get(i);
                        if (!room.getMapBo().getUnitMap().containsKey(key)) {
                            changeKeys.remove(i);
                            --i;
                        } else {
                            room.getMapBo().getUnitMap().put(key, MapUnitType.BRICK);
                        }
                    }
                    room.sendMessageToRoom(room.getMapBo().toDtoWithKeys(changeKeys), MessageType.MAP);
                }
            });
        }
    }

    void createMessageEvent(Object content, MessageType type, int timeout) {
        eventList.add(new BaseEvent(timeout) {
            @Override
            void process() {
                room.sendMessageToRoom(content, type);
            }
        });
    }

    void createLoadMapEvent(int timeout) {
        eventList.add(new BaseEvent(timeout) {
            @Override
            void process() {
                room.sendMessageToRoom(room.getMapBo().toDto(), MessageType.MAP);
                room.gameStatus.setType(GameStatusType.NORMAL);
                room.sendMessageToRoom(room.gameStatus, MessageType.GAME_STATUS);

                int timeout = 3 * 60;

                //陆续出现坦克
                for (Map.Entry<String, UserBo> kv : room.userMap.entrySet()) {
                    String tankId = kv.getValue().getUsername();
                    timeout = createTankEvent(kv.getValue(), tankId, timeout);
                }
                for (Map.Entry<String, BaseBotBo> kv : room.botMap.entrySet()) {
                    String tankId = kv.getValue().getBotUser().getUsername();
                    timeout = createTankEvent(kv.getValue().getBotUser(), tankId, timeout);
                }
            }
        });
    }

    void createTankEvent(UserBo user) {
        createTankEvent(user, user.getUsername(), 3 * 60);
    }

    void createTankEvent(UserBo user, String tankId) {
        createTankEvent(user, tankId, 3 * 60);
    }

    private int createTankEvent(UserBo user, String tankId, int timeout) {
        if (room.isBot(user.getTeamType())) {
            int count = room.getMapBo().getComputerStartCount();
            for (int i = 0; i < count; ++i) {
                this.eventList.add(newCreateTankEvent(user, CommonUtil.getId(), timeout));
                timeout += 60;
            }
        } else {
            this.eventList.add(newCreateTankEvent(user, tankId, timeout));
            timeout += 60;
        }
        return timeout;
    }

    private BaseEvent newCreateTankEvent(UserBo user, String tankId, int timeout) {
        return new BaseEvent(timeout) {
            @Override
            void process() {
                if (!userCheckBeforeCreateTank(user)) {
                    return;
                }

                List<StringCountDto> lifeMap = room.getLifeMap(user.getTeamType());
                if (lifeMap.isEmpty()) {
                    if (!room.isBot(user.getTeamType())) {
                        room.sendMessageToRoom(
                            String.format("没有剩余生命值, 玩家 %s 将变成观看模式",
                                          user.getUsername()),
                            MessageType.SYSTEM_MESSAGE);
                    }
                    return;
                }

                TankBo tankBo = new TankBo();
                tankBo.setTankId(tankId);
                tankBo.setUserId(user.getUsername());
                tankBo.setTeamType(user.getTeamType());
                setStartPoint(tankBo);
                if (!tankBo.isBot()) {
                    tankBo.setShieldTimeout(DEFAULT_SHIELD_TIME_FOR_NEW_TANK);
                }

                //复制并恢复玩家保存的状态
                TankTypeDto initType = getTankType(lifeMap, user);
                TankBo saveTank = room.tankStatusSaveMap.get(user.getUsername());
                if (saveTank == null) {
                    tankBo.setType(initType);
                    tankBo.setBulletCount(tankBo.getType().getAmmoMaxCount());
                    tankBo.setMaxBulletCount(tankBo.getType().getAmmoMaxCount());
                } else {
                    room.tankStatusSaveMap.remove(user.getUsername());
                    tankBo.setType(saveTank.getType());
                    tankBo.setBulletCount(saveTank.getMaxBulletCount());
                    tankBo.setMaxBulletCount(saveTank.getMaxBulletCount());
                    tankBo.setHasGhost(saveTank.isHasGhost());
                }

                room.tankMap.put(tankBo.getTankId(), tankBo);
                room.sendTankToRoom(tankBo);
            }
        };
    }

    private boolean userCheckBeforeCreateTank(UserBo user) {
        if (user.getTeamType() == TeamType.VIEW) {
            return false;
        }

        if (room.userMap.containsKey(user.getUsername())) {
            return true;
        }

        return room.botMap.containsKey(user.getUsername());
    }

    private void setStartPoint(TankBo tankBo) {
        MapBo map = room.getMapBo();
        String posStr;
        if (tankBo.getTeamType() == TeamType.RED) {
            posStr = map.getPlayerStartPoints().get(random.nextInt(map.getPlayerStartPoints().size()));
        } else {
            posStr = map.getComputerStartPoints().get(random.nextInt(map.getComputerStartPoints().size()));
        }
        Point point = CommonUtil.getPointFromKey(posStr);
        tankBo.setX(point.getX());
        tankBo.setY(point.getY());
    }

    /**
     * 根据队伍获得类型，并且更新life
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
        room.sendMessageToRoom(room.getMapBo().convertLifeCountToDto(), MessageType.MAP);
        String tankType = pair.getKey();
        if (room.isBot(userBo.getTeamType())) {
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
}

