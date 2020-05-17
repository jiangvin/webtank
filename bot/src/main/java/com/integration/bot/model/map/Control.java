package com.integration.bot.model.map;

import com.integration.dto.map.ActionType;
import com.integration.dto.map.OrientationType;
import lombok.Data;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/16
 */

@Data
public class Control {
    private OrientationType orientation;
    private OrientationType cacheOrientation;
    private ActionType action = ActionType.STOP;
    private Integer cacheX;
    private Integer cacheY;
}
