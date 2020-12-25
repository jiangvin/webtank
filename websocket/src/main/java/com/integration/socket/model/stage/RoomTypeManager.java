package com.integration.socket.model.stage;

import com.integration.dto.message.MessageType;
import com.integration.dto.room.GameStatusDto;
import com.integration.dto.room.GameStatusType;
import com.integration.dto.room.TeamType;
import com.integration.socket.model.ItemType;
import com.integration.socket.model.bo.TankBo;
import com.integration.socket.model.bo.UserBo;
import com.integration.socket.model.dto.StarDto;
import com.integration.socket.repository.jooq.tables.records.UserRecord;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.Map;

/**
 * @author 蒋文龙(Vin)
 * @description 提供不同RoomType的差异化支援
 * @date 2020/12/25
 */
class RoomTypeManager {
    private static final int MAX_SUB_ID = 5;

    private StageRoom room;

    RoomTypeManager(StageRoom room) {
        this.room = room;
    }

    void initItemPool() {
        switch (room.getRoomType()) {
            case PVP:
                initItemPoolPvp();
                break;
            default:
                initItemPoolPve();
                break;
        }
    }

    private void initItemPoolPvp() {
        room.itemTypePool.clear();
        room.itemTypePool.addAll(Arrays.asList(ItemType.values()));
        room.itemTypePool.remove(ItemType.KING);
    }

    private void initItemPoolPve() {
        room.itemTypePool.clear();
        room.itemTypePool.addAll(Arrays.asList(ItemType.values()));
        boolean hasRedStar = false;
        boolean hasGhost = false;
        boolean hasClock = false;
        for (Map.Entry<String, UserBo> kv : room.userMap.entrySet()) {
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
            room.itemTypePool.remove(ItemType.RED_STAR);
        }
        if (!hasGhost) {
            room.itemTypePool.remove(ItemType.GHOST);
        }
        if (!hasClock) {
            room.itemTypePool.remove(ItemType.CLOCK);
        }
    }

    boolean processGameOver(TeamType winTeam) {
        switch (room.getRoomType()) {
            case PVP:
                return processGameOverPvp(winTeam);
            default:
                return processGameOverPve(winTeam);
        }
    }

    private boolean processGameOverPvp(TeamType winTeam) {
        room.userMap.forEach((key, value) -> {
            if (value.getTeamType() == winTeam) {
                room.sendMessageToUser(new GameStatusDto(GameStatusType.END), MessageType.GAME_STATUS, value.getUsername());
            } else {
                room.sendMessageToUser(new GameStatusDto(GameStatusType.LOSE_PVP), MessageType.GAME_STATUS, value.getUsername());
            }
        });

        saveTankType();
        if (!room.mapManger.loadRandomMapPvp()) {
            room.gameStatus.setType(GameStatusType.WIN);
        } else {
            room.gameStatus.setType(GameStatusType.END);
        }
        return room.gameStatus.getType() == GameStatusType.END;
    }

    private boolean processGameOverPve(TeamType winTeam) {
        if (winTeam == TeamType.RED) {
            room.scoreBo.addWinScore(room.hardMode);
            room.scoreBo.addTotalScore();
            room.gameStatus.setScore(room.scoreBo.getTotalScore());
            room.gameStatus.setStar(room.mapStarService.getStarCount(room.scoreBo.getDeadCount()));
            room.gameStatus.setRank(room.userService.getRank(room.scoreBo.getTotalScore()));
            saveStar();

            int newMapId = room.getMapId();
            int newSubId = room.getSubId();
            if (newSubId < MAX_SUB_ID) {
                ++newSubId;
            } else {
                ++newMapId;
                newSubId = 1;
                saveStage();
            }
            int saveLife = saveTankType();
            if (!room.mapManger.loadNextMapPve(saveLife, newMapId, newSubId)) {
                room.gameStatus.setType(GameStatusType.WIN);
                room.userService.saveRankForMultiplePlayers(room.creator, room.gameStatus);
            } else {
                room.gameStatus.setType(GameStatusType.END);
            }
        } else {
            room.scoreBo.addTotalScore();
            room.gameStatus.setScore(room.scoreBo.getTotalScore());
            room.gameStatus.setRank(room.userService.getRank(room.scoreBo.getTotalScore()));
            room.gameStatus.setType(GameStatusType.LOSE);
            room.userService.saveRankForMultiplePlayers(room.creator, room.gameStatus);
        }
        room.sendMessageToRoom(room.gameStatus, MessageType.GAME_STATUS);

        return room.gameStatus.getType() == GameStatusType.END;
    }

    private void saveStar() {
        StarDto starDto = new StarDto();
        starDto.setHardMode(room.hardMode);
        starDto.setMapId(room.getMapId());
        starDto.setSubId(room.getSubId());
        starDto.setStar(room.gameStatus.getStar());
        for (Map.Entry<String, UserBo> kv : room.userMap.entrySet()) {
            UserBo user = kv.getValue();
            if (StringUtils.isEmpty(user.getUserId())) {
                continue;
            }
            starDto.setUserId(user.getUserId());
            room.userService.saveStarForMultiplePlayers(starDto);
        }
    }

    /**
     * 保持通关记录
     */
    private void saveStage() {
        UserRecord userRecord = room.creator.getUserRecord();
        if (userRecord == null) {
            return;
        }

        if (room.hardMode) {
            if (userRecord.getHardStage() == room.getMapId()) {
                userRecord.setHardStage(room.getMapId() + 1);
            }
        } else {
            if (userRecord.getStage() == room.getMapId()) {
                userRecord.setStage(room.getMapId() + 1);
                if (userRecord.getHardStage() == 0) {
                    userRecord.setHardStage(1);
                }
            }
        }
        userRecord.update();
    }

    private int saveTankType() {
        room.tankStatusSaveMap.clear();
        for (Map.Entry<String, TankBo> kv : room.tankMap.entrySet()) {
            TankBo tankBo = kv.getValue();
            if (tankBo.isBot()) {
                continue;
            }
            room.tankStatusSaveMap.put(tankBo.getUserId(), tankBo);
        }
        return room.tankStatusSaveMap.size();
    }
}
