package com.integration.socket.model.dto;

import com.integration.dto.map.MapDto;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/29
 */

@Data
@EqualsAndHashCode(callSuper = false)
public class MapDetailDto extends MapDto {
    private List<String> playerStartPos;
    private List<String> computerStartPos;
    private List<StringCountDto> computerTypeCountList;
    private int computerStartCount;
    private int maxGridX;
    private int maxGridY;
}
