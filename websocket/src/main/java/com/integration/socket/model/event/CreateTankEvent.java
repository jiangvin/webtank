package com.integration.socket.model.event;

import com.integration.socket.model.bo.UserBo;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/13
 */
@Data
@EqualsAndHashCode(callSuper = false)
public class CreateTankEvent extends BaseEvent {
    public CreateTankEvent(UserBo user, int timeout) {
        this.user = user;
        this.tankId = user.getUsername();
        setUsernameCheck(user.getUsername());
        setTimeout(timeout);
    }

    public CreateTankEvent(UserBo user, String tankId, int timeout) {
        this.user = user;
        this.tankId = tankId;
        setUsernameCheck(user.getUsername());
        setTimeout(timeout);
    }

    private UserBo user;
    private String tankId;
}
