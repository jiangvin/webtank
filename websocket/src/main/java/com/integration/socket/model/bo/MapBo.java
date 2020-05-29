package com.integration.socket.model.bo;

import com.integration.dto.map.ItemDto;
import com.integration.dto.map.MapUnitType;
import com.integration.dto.map.MapDto;
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

    private String mapName;

    private ConcurrentHashMap<String, Integer> playerLife = new ConcurrentHashMap<>();

    private ConcurrentHashMap<String, Integer> computerLife = new ConcurrentHashMap<>();

    private ConcurrentHashMap<String, MapUnitType> unitMap = new ConcurrentHashMap<>();

    private List<String> playerStartPoints = new ArrayList<>();

    private List<String> computerStartPoints = new ArrayList<>();

    public MapDto convertToDto() {
        MapDto mapDto = convertLifeCountToDto();
        mapDto.setWidth(getWidth());
        mapDto.setHeight(getHeight());
        mapDto.setMapId(getMapId());
        mapDto.setMapName(getMapName());
        List<ItemDto> itemList = new ArrayList<>();
        for (Map.Entry<String, MapUnitType> kv : getUnitMap().entrySet()) {
            ItemDto item = new ItemDto();
            item.setId(kv.getKey());
            item.setTypeId(kv.getValue().getValue().toString());
            itemList.add(item);
        }
        mapDto.setItemList(itemList);
        return mapDto;
    }

    public MapDto convertLifeCountToDto() {
        MapDto mapDto = new MapDto();
        mapDto.setPlayerLife(getCount(getPlayerLife()));
        mapDto.setComputerLife(getCount(getComputerLife()));
        return mapDto;
    }


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

    private int getCount(Map<String, Integer> lifeMap) {
        int life = 0;
        for (Map.Entry<String, Integer> kv : lifeMap.entrySet()) {
            life += kv.getValue();
        }
        return life;
    }
}
