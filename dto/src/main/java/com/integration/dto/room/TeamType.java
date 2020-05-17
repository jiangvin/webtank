package com.integration.dto.room;

/**
 * @author 蒋文龙(Vin)
 * @description 团队编号
 * @date 2020/5/6
 */
public enum TeamType {
    VIEW(0),
    RED(1),
    BLUE(2);

    private final int value;

    TeamType(int value) {
        this.value = value;
    }

    public int getValue() {
        return this.value;
    }

    public static TeamType convert(int value) {
        for (TeamType teamType : TeamType.values()) {
            if (teamType.value == value) {
                return teamType;
            }
        }
        return TeamType.VIEW;
    }
}
