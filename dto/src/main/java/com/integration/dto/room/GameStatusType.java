package com.integration.dto.room;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/6
 */
public enum GameStatusType {
    /**
     * 小关结束/胜利
     */
    END,
    /**
     * 暂停
     */
    PAUSE,
    /**
     * 全部胜利
     */
    WIN,
    /**
     * 失败
     */
    LOSE,
    /**
     * 红队暂停事件
     */
    PAUSE_RED,
    /**
     * 蓝队暂停事件
     */
    PAUSE_BLUE,
    /**
     * 正常
     */
    NORMAL
}
