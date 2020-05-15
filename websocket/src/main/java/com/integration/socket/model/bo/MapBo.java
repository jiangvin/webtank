package com.integration.socket.model.bo;

import com.integration.socket.model.MapUnitType;
import com.integration.util.model.CustomException;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/10
 */

@Data
public class MapBo {
    private int computerStartCount = 0;

    private int width;

    private int height;

    private int maxGridX;

    private int maxGridY;

    private int playerLifeTotalCount = 0;

    private int computerLifeTotalCount = 0;

    private String mapId;

    private ConcurrentHashMap<String, Integer> playerLife = new ConcurrentHashMap<>();

    private ConcurrentHashMap<String, Integer> computerLife = new ConcurrentHashMap<>();

    private ConcurrentHashMap<String, MapUnitType> unitMap = new ConcurrentHashMap<>();

    private List<String> playerStartPoints = new ArrayList<>();

    private List<String> computerStartPoints = new ArrayList<>();

    public void setTotalLifeCount() {
        this.playerLifeTotalCount = getCount(this.playerLife);
        this.computerLifeTotalCount = getCount(this.computerLife);
    }

    public void checkSelf() {
        if (width == 0 || height == 0) {
            throw new CustomException("宽高不能为空");
        }

        if (computerStartCount == 0) {
            throw new CustomException("初始的电脑数量不能为0");
        }
        if (playerLife.isEmpty()) {
            throw new CustomException("玩家生命不能为0");
        }
        if (computerLife.isEmpty()) {
            throw new CustomException("电脑类型不能为空");
        }
        if (playerStartPoints.isEmpty()) {
            throw new CustomException("玩家出生点不能为空");
        }
        if (computerStartPoints.isEmpty()) {
            throw new CustomException("电脑出生点不能为空");
        }
    }

    private void duplicate(ConcurrentHashMap<String, Integer> map, ConcurrentHashMap<String, Integer> target) {
        map.clear();
        for (Map.Entry<String, Integer> kv : target.entrySet()) {
            map.put(kv.getKey(), kv.getValue());
        }
    }

    public void duplicatePlayer() {
        duplicate(computerLife, playerLife);
        this.computerLifeTotalCount = this.playerLifeTotalCount;
    }

    public void duplicateComputer() {
        duplicate(playerLife, computerLife);
        this.playerLifeTotalCount = this.computerLifeTotalCount;
    }

    public void removeMapUnit(MapUnitType mapUnitType) {
        List<String> removeKeys = new ArrayList<>();
        for (Map.Entry<String, MapUnitType> kv : unitMap.entrySet()) {
            if (kv.getValue() == mapUnitType) {
                removeKeys.add(kv.getKey());
            }
        }
        for (String key : removeKeys) {
            unitMap.remove(key);
        }
    }

    public int getCount(Map<String, Integer> lifeMap) {
        int life = 0;
        for (Map.Entry<String, Integer> kv : lifeMap.entrySet()) {
            life += kv.getValue();
        }
        return life;
    }
}
