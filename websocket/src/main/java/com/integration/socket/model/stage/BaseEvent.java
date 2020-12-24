package com.integration.socket.model.stage;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/24
 */
abstract class BaseEvent {
    private int timeout;
    private int refreshTimeout;
    private int refreshIncrease;
    private boolean isLoop = false;

    BaseEvent(int timeout) {
        this.timeout = timeout;
    }

    BaseEvent(int timeout, int increase) {
        this.isLoop = true;
        this.refreshTimeout = timeout;
        this.refreshIncrease = increase;
        this.timeout = timeout;
    }

    boolean update() {
        if (timeout > 0) {
            --timeout;
            return false;
        }

        process();
        if (isLoop) {
            refresh();
        }
        return !isLoop;
    }

    private void refresh() {
        refreshTimeout += refreshIncrease;
        timeout = refreshTimeout;
    }

    /**
     * 具体事件的运行的逻辑
     */
    abstract void process();
}
