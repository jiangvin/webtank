package com.integration.socket.service;

import com.integration.dto.room.RoomType;
import com.integration.socket.model.Constant;
import com.integration.socket.model.bo.MapBo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/17
 */

@Service
@Slf4j
public class MapStarService {
    @Autowired
    private MapService mapService;

    private Map<String, Integer> baseScoreMap = new ConcurrentHashMap<>();

    public int getStarCount(int mapId, int subId, boolean hardMode, int score) {
        int baseScore = getBaseScore(mapId, subId, hardMode);
        if (score < baseScore) {
            return 1;
        }
        if (score < baseScore + Constant.SCORE_WIN / 2) {
            return 2;
        }
        return 3;
    }

    void saveBaseScore(MapBo mapBo) {
        int score = mapBo.getComputerLifeCount() * Constant.SCORE_COM_BOOM;
        baseScoreMap.put(generateMapKey(mapBo.getMapId(), mapBo.getSubId()), score);
    }

    private int getBaseScore(int mapId, int subId, boolean hardMode) {
        String key = generateMapKey(mapId, subId);
        if (!baseScoreMap.containsKey(key)) {
            loadMapBaseScore(mapId, subId);
        }
        int score = baseScoreMap.getOrDefault(key, Constant.SCORE_WIN * 2);
        if (hardMode) {
            score += Constant.SCORE_HARD_MODE;
        }
        return score;
    }

    private String generateMapKey(int mapId, int subId) {
        return String.format("%d-%d", mapId, subId);
    }

    private void loadMapBaseScore(int mapId, int subId) {
        try {
            MapBo mapBo = mapService.loadMap(mapId, subId, RoomType.PVE);
            saveBaseScore(mapBo);
        } catch (Exception e) {
            log.warn("load map:{}-{} error:{}", mapId, subId, e.getMessage());
        }
    }
}
