package com.integration.socket.model.bo;

import com.integration.dto.map.ItemDto;
import com.integration.dto.map.MapDto;
import com.integration.dto.map.MapUnitType;
import com.integration.socket.model.dto.MapDetailDto;
import com.integration.socket.model.dto.StringCountDto;
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

    private int mapId;

    private String mapName;

    private List<StringCountDto> playerLife = new ArrayList<>();

    private List<StringCountDto> computerLife = new ArrayList<>();

    private ConcurrentHashMap<String, MapUnitType> unitMap = new ConcurrentHashMap<>();

    private List<String> playerStartPoints = new ArrayList<>();

    private List<String> computerStartPoints = new ArrayList<>();

    public MapDto convertToDto() {
        MapDto mapDto = new MapDto();
        copyProperties(mapDto);
        return mapDto;
    }

    private void copyProperties(MapDto mapDto) {
        copyLifeCountProperties(mapDto);
        mapDto.setMapId(getMapId());
        mapDto.setWidth(getWidth());
        mapDto.setHeight(getHeight());
        mapDto.setMapName(getMapName());
        List<ItemDto> itemList = new ArrayList<>();
        for (Map.Entry<String, MapUnitType> kv : getUnitMap().entrySet()) {
            ItemDto item = new ItemDto();
            item.setId(kv.getKey());
            item.setTypeId(kv.getValue().getValue().toString());
            itemList.add(item);
        }
        mapDto.setItemList(itemList);
    }

    public MapDetailDto toDetailDto() {
        MapDetailDto mapDetailDto = new MapDetailDto();
        copyProperties(mapDetailDto);

        mapDetailDto.setPlayerStartPos(this.playerStartPoints);
        mapDetailDto.setComputerStartPos(this.computerStartPoints);
        mapDetailDto.setComputerTypeCountList(this.computerLife);
        mapDetailDto.setComputerStartCount(this.computerStartCount);

        return mapDetailDto;
    }

    public MapDto convertLifeCountToDto() {
        MapDto mapDto = new MapDto();
        copyLifeCountProperties(mapDto);
        return mapDto;
    }

    private void copyLifeCountProperties(MapDto mapDto) {
        mapDto.setPlayerLife(getCount(getPlayerLife()));
        mapDto.setComputerLife(getCount(getComputerLife()));
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

    private void duplicate(List<StringCountDto> list, List<StringCountDto> target) {
        list.clear();
        for (StringCountDto kv : target) {
            list.add(StringCountDto.copy(kv));
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

    private int getCount(List<StringCountDto> lifeList) {
        int life = 0;
        for (StringCountDto kv : lifeList) {
            life += kv.getValue();
        }
        return life;
    }
}
