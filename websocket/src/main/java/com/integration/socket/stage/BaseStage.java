package com.integration.socket.stage;

import com.integration.socket.model.dto.MessageDto;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/3
 */
public abstract class BaseStage {

    /**
     * 处理消息入口
     * @param messageDto
     * @param sendFrom
     */
    public abstract void processMessage(MessageDto messageDto, String sendFrom);

    /**
     * 每一帧的更新数据 （17ms 一帧，模拟1秒60帧刷新模式）
     */
    public abstract void update();


    /**
     * 用户离开时触发
     * @param username 离开的用户名
     */
    public abstract void remove(String username);
}
