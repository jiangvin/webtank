package com.integration.dto.map;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/1
 */
public enum ActionType {
    STOP(0),
    RUN(1),
    UNKNOWN(-1);

    private int value;

    ActionType(int value) {
        this.value = value;
    }

    public final int getValue() {
        return this.value;
    }

    public static ActionType convert(int value) {
        for (ActionType actionType : ActionType.values()) {
            if (actionType.value == value) {
                return actionType;
            }
        }
        return ActionType.UNKNOWN;
    }
}
