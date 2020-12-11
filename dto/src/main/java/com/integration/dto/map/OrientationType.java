package com.integration.dto.map;

import java.util.Random;

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

    public OrientationType getBack() {
        switch (this) {
            case UP:
                return OrientationType.DOWN;
            case DOWN:
                return OrientationType.UP;
            case LEFT:
                return OrientationType.RIGHT;
            case RIGHT:
                return OrientationType.LEFT;
            default:
                return OrientationType.UNKNOWN;
        }
    }

    public static OrientationType convert(int value) {
        for (OrientationType orientationType : OrientationType.values()) {
            if (orientationType.value == value) {
                return orientationType;
            }
        }
        return OrientationType.UNKNOWN;
    }

    public static OrientationType getRandomOrientation() {
        return convert(new Random().nextInt(4));
    }
}
