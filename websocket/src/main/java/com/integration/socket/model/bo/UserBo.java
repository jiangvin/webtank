package com.integration.socket.model.bo;

import com.integration.dto.message.MessageDto;
import com.integration.dto.room.TeamType;
import com.integration.socket.repository.jooq.tables.records.UserRecord;
import com.integration.util.time.TimeUtil;
import lombok.Data;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/4/28
 */
@Data
@Slf4j
public class UserBo {
    /**
     * 全局唯一, 但会根据重名情况进行变化
     */
    @NonNull
    private String username;

    /**
     * 网页用户没有userId
     */
    private String userId;

    /**
     * 用户当前所在的房间号
     */
    private String roomId;

    /**
     * 用户在房间号内的团队
     */
    private TeamType teamType;

    /**
     * 持久层数据
     */
    private UserRecord userRecord;

    public boolean hasUserId() {
        return !StringUtils.isEmpty(userId);
    }

    public boolean hasRedStar() {
        if (userRecord == null) {
            return false;
        }

        if (userRecord.getRedStarExpired() == null) {
            return false;
        }

        return userRecord.getRedStarExpired().after(TimeUtil.now());
    }

    public boolean hasGhost() {
        if (userRecord == null) {
            return false;
        }

        if (userRecord.getGhostExpired() == null) {
            return false;
        }

        return userRecord.getGhostExpired().after(TimeUtil.now());
    }

    public boolean hasClock() {
        if (userRecord == null) {
            return false;
        }

        if (userRecord.getClockExpired() == null) {
            return false;
        }

        return userRecord.getClockExpired().after(TimeUtil.now());
    }

    /**
     * 发送消息, 仅仅只是记录日志
     * @param messageDto
     */
    public void sendMessage(MessageDto messageDto) {
        log.info("user:{} mock send message:{}", username, messageDto.toString());
    }

    public void disconnect() {
        log.info("user:{} mock disconnect", username);
    }
}
