package com.integration.bot.model.event;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/17
 */

public abstract class BaseLoopEvent extends BaseEvent {
    private int totalCheckTime;
    private int checkTime = 0;
    private long timeoutCache;

    BaseLoopEvent(long timeout, int totalCheckTime) {
        super(timeout);
        this.totalCheckTime = totalCheckTime;
        this.timeoutCache = timeout;
    }

    public boolean isFinished() {
        if (checkTime >= totalCheckTime) {
            return true;
        }

        ++checkTime;
        this.timeout = timeoutCache;
        return false;
    }
}
