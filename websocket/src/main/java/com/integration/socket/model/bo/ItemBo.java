package com.integration.socket.model.bo;

import com.integration.dto.map.ItemDto;
import com.integration.socket.model.ItemType;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.awt.Point;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/17
 */

@Data
@AllArgsConstructor
public class ItemBo {
    private String posKey;
    private Point pos;
    private String id;
    private ItemType type;

    public ItemDto toDto() {
        ItemDto itemDto = new ItemDto();
        itemDto.setId(id);
        itemDto.setTypeId(type.toString());
        itemDto.setX((double) pos.x);
        itemDto.setY((double) pos.y);
        return itemDto;
    }
}
