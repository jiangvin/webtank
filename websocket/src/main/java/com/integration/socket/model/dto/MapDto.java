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
        mapDto.setPlayerLife(mapBo.getCount(mapBo.getPlayerLife()));
        mapDto.setComputerLife(mapBo.getCount(mapBo.getComputerLife()));
        return mapDto;
    }

    public static MapDto convert(String key, MapUnitType type) {
        MapDto mapDto = new MapDto();
        List<ItemDto> itemList = new ArrayList<>();
        ItemDto item = new ItemDto();
        item.setId(key);
        item.setTypeId(type.toString());
        itemList.add(item);
        mapDto.setItemList(itemList);
        return mapDto;
    }
}
