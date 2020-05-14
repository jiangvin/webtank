package com.integration.socket.model;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/14
 */
public enum CollideType {
    COLLIDE_NONE,
    /**
     * 撞上了坦克
     */
    COLLIDE_TANK,
    /**
     * 撞上了地图
     */
    COLLIDE_MAP,
    /**
     * 撞到边界
     */
    COLLIDE_BOUNDARY,
}
