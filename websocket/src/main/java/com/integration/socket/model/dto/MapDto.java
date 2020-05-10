package com.integration.socket.model.dto;

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

@Data
public class MapDto {
    private Integer width;
    private Integer height;
    private Integer playerLife;
    private Integer computerLife;
    private List<ItemDto> itemList;

    public static MapDto convert(MapBo mapBo) {
        MapDto mapDto = new MapDto();
        mapDto.setWidth(mapBo.getWidth());
        mapDto.setHeight(mapBo.getHeight());
        mapDto.setPlayerLife(mapBo.getPlayerLife());

        int computerLife = 0;
        for (Map.Entry<String, Integer> kv : mapBo.getComputerLife().entrySet()) {
            computerLife += kv.getValue();
        }
        mapDto.setComputerLife(computerLife);

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
}
