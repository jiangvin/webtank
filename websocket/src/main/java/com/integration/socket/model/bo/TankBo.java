package com.integration.socket.model.bo;

import com.integration.dto.map.ActionType;
import com.integration.dto.map.ItemDto;
import com.integration.dto.map.OrientationType;
import com.integration.dto.room.TeamType;
import com.integration.socket.model.dto.TankTypeDto;
import com.integration.util.CommonUtil;
import lombok.Data;

import java.awt.Point;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/1
 */

@Data
public class TankBo {
    private String tankId;
    private String userId;
    private OrientationType orientationType = OrientationType.getRandomOrientation();
    private ActionType actionType = ActionType.STOP;
    private TeamType teamType;
    private double x;
    private double y;
    private TankTypeDto type;
    private int reloadTime;
    private int bulletCount;
    private int maxBulletCount;
    private int shieldTimeout = 0;
    private boolean hasGhost = false;
    private String skin;

    public ItemDto toDto() {
        ItemDto tankDto = new ItemDto();
        tankDto.setId(getTankId());
        tankDto.setX(getX());
        tankDto.setY(getY());
        tankDto.setTypeId(getType().getTypeId());
        tankDto.setOrientation(getOrientationType().getValue());
        tankDto.setAction(getActionType().getValue());
        tankDto.setSpeed(getType().getSpeed());
        tankDto.setBulletCount(getBulletCount());
        tankDto.setReloadTime(getReloadTime());
        tankDto.setUserId(getUserId());
        tankDto.setHasGhost(isHasGhost());
        tankDto.setSkin(getSkin());

        if (getTeamType() != null) {
            tankDto.setTeamId(getTeamType().getValue());
        }
        if (hasShield()) {
            tankDto.setHasShield(true);
        }
        return tankDto;
    }

    public boolean hasShield() {
        return shieldTimeout > 0;
    }

    public boolean isBot() {
        return !this.tankId.equals(this.userId);
    }

    public boolean levelUpToTop() {
        boolean levelUp = false;
        while (levelUp()) {
            levelUp = true;
        }
        return levelUp;
    }

    public boolean levelUp() {
        if (type.getUpId() == null) {
            return false;
        }

        return changeType(type.getUpId());
    }

    public boolean levelDown() {
        if (type.getDownId() == null) {
            return false;
        }

        return changeType(type.getDownId());
    }

    private boolean changeType(String typeId) {
        TankTypeDto newType = TankTypeDto.getTankType(typeId);
        if (newType == null) {
            return false;
        }
        reloadTime += newType.getAmmoReloadTime() - type.getAmmoReloadTime();
        bulletCount += newType.getAmmoMaxCount() - type.getAmmoMaxCount();
        maxBulletCount += newType.getAmmoMaxCount() - type.getAmmoMaxCount();
        type = newType;
        return true;
    }

    public BulletBo fire() {
        if (bulletCount <= 0) {
            return null;
        }

        if (reloadTime > 0) {
            return null;
        }

        //重置重新填装
        --bulletCount;
        reloadTime = type.getAmmoReloadTime();
        Point bulletPos = getBulletPos();
        return new BulletBo(
                   CommonUtil.getId(),
                   this.tankId,
                   this.teamType,
                   type.getAmmoMaxLifeTime(),
                   bulletPos.x,
                   bulletPos.y,
                   this.getType().getAmmoSpeed(),
                   this.getType().isBrokenIron(),
                   this.orientationType);
    }

    private Point getBulletPos() {
        Point point = new Point((int) x, (int) y);
        int half = CommonUtil.UNIT_SIZE / 2;
        switch (orientationType) {
            case UP:
                point.y -= half;
                break;
            case DOWN:
                point.y += half;
                break;
            case LEFT:
                point.x -= half;
                break;
            case RIGHT:
                point.x += half;
                break;
            default:
                break;
        }
        return point;
    }

    public void run(double speed) {
        switch (getOrientationType()) {
            case UP:
                this.y -= speed;
                break;
            case DOWN:
                this.y += speed;
                break;
            case LEFT:
                this.x -= speed;
                break;
            case RIGHT:
                this.x += speed;
                break;
            default:
                break;
        }
    }

    public void addAmmoCount() {
        ++bulletCount;
    }
}
