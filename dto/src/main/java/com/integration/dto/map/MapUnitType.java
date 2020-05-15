package com.integration.dto.map;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/10
 */
public enum MapUnitType {
    BRICK(0),
    BROKEN_BRICK(1),
    IRON(2),
    BROKEN_IRON(3),
    RIVER(4),
    GRASS(5),
    RED_KING(6),
    BLUE_KING(7);

    private int value;

    MapUnitType(int value) {
        this.value = value;
    }

    public final Integer getValue() {
        return this.value;
    }

    public static MapUnitType convert(int value) {
        for (MapUnitType mapUnitType : MapUnitType.values()) {
            if (mapUnitType.value == value) {
                return mapUnitType;
            }
        }
        return null;
    }
}
