package com.integration.socket.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.integration.socket.model.MapUnitType;
import com.integration.socket.model.bo.MapBo;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/10
 */

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
public class MapDto {
    private Integer width;
    private Integer height;
    private Integer playerLife;
    private Integer computerLife;
    private List<ItemDto> itemList;

    public static MapDto convert(MapBo mapBo) {
        MapDto mapDto = convertLifeCount(mapBo);
        mapDto.setWidth(mapBo.getWidth());
        mapDto.setHeight(mapBo.getHeight());

        List<ItemDto> itemList = new ArrayList<>();
        for (Map.Entry<String, MapUnitType> kv : mapBo.getUnitMap().entrySet()) {
            ItemDto item = new ItemDto();
            item.setId(kv.getKey());
            item.setTypeId(kv.getValue().toString());
            itemList.add(item);
        }
        mapDto.setItemList(itemList);
        return mapDto;
    }

    public static MapDto convertLifeCount(MapBo mapBo) {
        MapDto mapDto = new MapDto();
        mapDto.setPlayerLife(getCount(mapBo.getPlayerLife()));
        mapDto.setComputerLife(getCount(mapBo.getComputerLife()));
        return mapDto;
    }

    private static int getCount(Map<String, Integer> map) {
        int life = 0;
        for (Map.Entry<String, Integer> kv : map.entrySet()) {
            life += kv.getValue();
        }
        return life;
    }
}
