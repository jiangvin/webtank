package com.integration.socket.model.bo;

import com.integration.socket.model.OrientationType;
import com.integration.socket.model.TeamType;
import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/9
 */

@Data
@AllArgsConstructor
public class BulletBo {
    private String id;
    private String tankId;
    private TeamType teamType;
    private int lifeTime;
    private double x;
    private double y;
    private double speed;
    private boolean brokenIron;
    OrientationType orientationType;
    private String startGridKey;
    private String endGridKey;
    private long lastSyncTime;

    public void refreshSyncTime() {
        this.lastSyncTime = System.currentTimeMillis();
    }

    public void run() {
        switch (orientationType) {
            case UP:
                y -= speed;
                break;
            case DOWN:
                y += speed;
                break;
            case LEFT:
                x -= speed;
                break;
            case RIGHT:
                x += speed;
                break;
            default:
                break;
        }
    }
}
