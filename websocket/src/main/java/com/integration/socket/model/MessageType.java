package com.integration.socket.model;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/4/26
 */
public enum MessageType {
    /**
     * 双向发送
     * 服务器和客户端都有可能是发送方
     */
    USER_MESSAGE,

    /**
     * 单向发送
     * 服务器 -> 客户端
     */
    SYSTEM_MESSAGE,
    /**
     * 数据传输完毕，通知前端可以解除暂停
     */
    SERVER_READY,
    /**
     * 所有用户id列表
     */
    USERS,
    /**
     * tank状态列表
     */
    TANKS,
    /**
     * 删除
     */
    REMOVE_TANK,

    /**
     * 单向发送
     * 客户端 -> 服务器
     * 用户准备完毕
     */
    CLIENT_READY,

    /**
     * 同步状态，为了避免客户端作弊，只传递状态
     */
    UPDATE_TANK_CONTROL,
}
