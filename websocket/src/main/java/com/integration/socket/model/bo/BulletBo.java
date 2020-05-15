package com.integration.socket.model.bo;

import com.integration.dto.OrientationType;
import com.integration.dto.room.TeamType;
import com.integration.dto.map.ItemDto;
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

    public ItemDto convertToDto() {
        ItemDto ammoDto = new ItemDto();
        ammoDto.setId(getId());
        ammoDto.setX(getX());
        ammoDto.setY(getY());
        ammoDto.setOrientation(getOrientationType().getValue());
        ammoDto.setSpeed(getSpeed());
        return ammoDto;
    }

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
