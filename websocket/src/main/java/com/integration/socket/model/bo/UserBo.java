package com.integration.socket.model.bo;

import com.integration.dto.room.TeamType;
import lombok.Data;
import lombok.NonNull;

import java.util.ArrayList;
import java.util.List;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/4/28
 */
@Data
public class UserBo {
    @NonNull private String username;
    @NonNull private String socketSessionId;

    final private List<String> subscribeList = new ArrayList<>();

    /**
     * 用户当前所在的房间号
     */
    private String roomId;

    /**
     * 用户在房间号内的团队
     */
    private TeamType teamType;
}
