package com.integration.bot.model.map;

import com.integration.dto.map.ActionType;
import com.integration.dto.map.ItemDto;
import com.integration.dto.map.OrientationType;
import com.integration.dto.room.TeamType;
import lombok.Data;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/15
 */

@Data
public class Tank {
    private String id;
    private String userId;
    private OrientationType orientationType;
    private ActionType actionType;
    private TeamType teamType;
    private double x;
    private double y;
    private int reloadTime;
    private int bulletCount;
    private double speed;
    private OrientationType lastSendOrientation;
    private ActionType lastSendAction;

    public static Tank convert(ItemDto item) {
        Tank tank = new Tank();
        tank.setId(item.getId());
        tank.setOrientationType(OrientationType.convert(item.getOrientation()));
        tank.setActionType(ActionType.convert(item.getAction()));
        tank.setTeamType(TeamType.convert(item.getTeamId()));
        tank.setX(item.getX());
        tank.setY(item.getY());
        tank.setReloadTime(item.getReloadTime());
        tank.setBulletCount(item.getBulletCount());
        tank.setUserId(item.getUserId());
        tank.setSpeed(item.getSpeed());
        return tank;
    }

    public void copyPropertyFromServer(Tank tank) {
        x = tank.x;
        y = tank.y;
        reloadTime = tank.reloadTime;
        bulletCount = tank.bulletCount;
        speed = tank.speed;

        lastSendOrientation = tank.orientationType;
        lastSendAction = tank.actionType;
    }

    public void run() {
        if (actionType == ActionType.STOP) {
            return;
        }
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

    public void reloadBullet() {
        if (reloadTime <= 0) {
            return;
        }
        --reloadTime;
    }
}
