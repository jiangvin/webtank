package com.integration.socket.model.bo;

import com.integration.dto.map.ActionType;
import com.integration.dto.map.ItemDto;
import com.integration.dto.map.OrientationType;
import com.integration.dto.room.TeamType;
import com.integration.util.CommonUtil;
import lombok.Data;

import java.awt.Point;
import java.util.ArrayList;
import java.util.List;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/1
 */

@Data
public class TankBo {
    private String tankId;
    private String userId;
    private OrientationType orientationType = OrientationType.UP;
    private ActionType actionType = ActionType.STOP;
    private TeamType teamType;
    private double x;
    private double y;
    private TankTypeBo type;
    private int reloadTime;
    private int bulletCount;
    private long lastSyncTime = System.currentTimeMillis();
    private List<String> gridKeyList = new ArrayList<>();

    public ItemDto convertToDto() {
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
        if (getTeamType() != null) {
            tankDto.setTeamId(getTeamType().getValue());
        }
        return tankDto;
    }

    public void refreshSyncTime() {
        this.lastSyncTime = System.currentTimeMillis();
    }

    public static TankBo convert(ItemDto tankDto) {
        TankBo tankBo = new TankBo();
        tankBo.setTankId(tankDto.getId());
        tankBo.setUserId(tankDto.getId());
        tankBo.setOrientationType(OrientationType.convert(tankDto.getOrientation()));
        tankBo.setActionType(ActionType.convert(tankDto.getAction()));
        tankBo.setX(tankDto.getX());
        tankBo.setY(tankDto.getY());
        tankBo.setType(TankTypeBo.getTankType(tankDto.getTypeId()));
        tankBo.setBulletCount(tankBo.getType().getAmmoMaxCount());

        //bo的team type不能为空
        if (tankDto.getTeamId() == null) {
            tankBo.setTeamType(TeamType.RED);
        } else {
            tankBo.setTeamType(TeamType.convert(tankDto.getTeamId()));
        }
        return tankBo;
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
        TankTypeBo newType = TankTypeBo.getTankType(typeId);
        if (newType == null) {
            return false;
        }
        reloadTime += newType.getAmmoReloadTime() - type.getAmmoReloadTime();
        bulletCount += newType.getAmmoMaxCount() - type.getAmmoMaxCount();
        type = newType;
        return true;
    }

    public BulletBo fire() {
        if (bulletCount <= 0) {
            return null;
        }

        if (reloadTime != 0) {
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
                   this.orientationType,
                   null,
                   null,
                   System.currentTimeMillis());
    }

    private Point getBulletPos() {
        Point point = new Point((int)x, (int)y);
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

    public List<String> generateGridKeyList() {
        List<String> keys = new ArrayList<>();
        int size = CommonUtil.UNIT_SIZE;
        //缩小一个像素点检测，减少误差
        int half = size / 2 - 1;
        CommonUtil.addWithoutRepeat(CommonUtil.generateGridKey(x - half, y - half), keys);
        CommonUtil.addWithoutRepeat(CommonUtil.generateGridKey(x + half, y - half), keys);
        CommonUtil.addWithoutRepeat(CommonUtil.generateGridKey(x - half, y + half), keys);
        CommonUtil.addWithoutRepeat(CommonUtil.generateGridKey(x + half, y + half), keys);
        return keys;
    }
}
