package com.integration.socket.model.bo;

import com.integration.socket.model.OrientationType;
import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/9
 */

@Data
@AllArgsConstructor
public class AmmoBo {
    private String id;
    private int lifeTime;
    private double x;
    private double y;
    private double speed;
    OrientationType orientationType;
}
