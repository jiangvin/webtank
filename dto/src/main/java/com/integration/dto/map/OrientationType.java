package com.integration.dto.map;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/1
 */
public enum OrientationType {
    UP(0),
    DOWN(1),
    LEFT(2),
    RIGHT(3),
    UNKNOWN(-1);

    private final int value;

    OrientationType(int value) {
        this.value = value;
    }

    public int getValue() {
        return this.value;
    }

    public static OrientationType convert(int value) {
        for (OrientationType orientationType : OrientationType.values()) {
            if (orientationType.value == value) {
                return orientationType;
            }
        }
        return OrientationType.UNKNOWN;
    }
}
