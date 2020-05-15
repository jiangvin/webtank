package com.integration.dto.map;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

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
    private String mapId;
    private List<ItemDto> itemList;

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
