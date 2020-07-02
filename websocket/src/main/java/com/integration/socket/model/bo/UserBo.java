package com.integration.socket.model.bo;

import com.integration.dto.room.TeamType;
import com.integration.socket.repository.jooq.tables.records.UserRecord;
import com.integration.util.time.TimeUtil;
import lombok.Data;
import lombok.NonNull;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/4/28
 */
@Data
public class UserBo {
    /**
     * 全局唯一, 但会根据重名情况进行变化
     */
    @NonNull private String username;
    @NonNull private String socketSessionId;

    /**
     * 网页用户没有userId
     */
    private String userId;

    final private List<String> subscribeList = new ArrayList<>();

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
}
