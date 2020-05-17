package com.integration.bot.model;

import com.integration.bot.model.map.Tank;
import com.integration.bot.model.dto.RequestBotDto;
import com.integration.dto.map.ActionType;
import com.integration.dto.map.MapUnitType;
import com.integration.dto.map.OrientationType;
import com.integration.dto.message.MessageDto;
import com.integration.dto.message.MessageType;
import com.integration.util.CommonUtil;

import java.awt.Point;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/15
 */

public class SimpleBot extends BaseBot {
    public SimpleBot(RequestBotDto requestBotDto) {
        super(requestBotDto);
    }

    /**
     *  x-1 / x 的概率继续前进
     */
    private static final int KEEP_GOING_RATE = 120;

    /**
     * 阻塞的时候 x-1 / x的概率不动
     */
    private static final int KEEP_TRY_RATE = 30;

    /**
     * 发射子弹有半秒延迟
     */
    private static final int COMMON_RELOAD_TIME = 30;

    private Random random = new Random();

    @Override
    void updateExtension() {
        for (Map.Entry<String, Tank> kv : tankMap.entrySet()) {
            Tank tank = kv.getValue();
            updateTank(tank, false);
            tank.run();
            tank.reloadBullet();
            syncControl(tank);
        }
    }

    private void syncControl(Tank tank) {
        if (tank.getOrientationType() == tank.getLastSendOrientation() && tank.getActionType() == tank.getLastSendAction()) {
            return;
        }

        tank.setLastSendOrientation(tank.getOrientationType());
        tank.setLastSendAction(tank.getActionType());
        sendTankControl(tank);
    }

    private void updateTank(Tank tank, boolean ignoreCollideWithTanks) {
        if (!tank.getUserId().equals(name)) {
            return;
        }

        if (tank.getBulletCount() != 0 && tank.getReloadTime() == 0) {
            sendMessage(new MessageDto(tank.getId(), MessageType.UPDATE_TANK_FIRE));
            tank.setReloadTime(COMMON_RELOAD_TIME);
        }

        tank.setActionType(ActionType.RUN);
        boolean forward = canPass(tank, tank.getOrientationType(), ignoreCollideWithTanks);
        if (forward && random.nextInt(KEEP_GOING_RATE) != 0) {
            return;
        }

        List<OrientationType> sideList = new ArrayList<>();
        OrientationType back = null;
        switch (tank.getOrientationType()) {
            case UP:
                if (canPass(tank, OrientationType.LEFT, ignoreCollideWithTanks)) {
                    sideList.add(OrientationType.LEFT);
                }
                if (canPass(tank, OrientationType.RIGHT, ignoreCollideWithTanks)) {
                    sideList.add(OrientationType.RIGHT);
                }
                if (canPass(tank, OrientationType.DOWN, ignoreCollideWithTanks)) {
                    back = OrientationType.DOWN;
                }
                break;
            case DOWN:
                if (canPass(tank, OrientationType.LEFT, ignoreCollideWithTanks)) {
                    sideList.add(OrientationType.LEFT);
                }
                if (canPass(tank, OrientationType.RIGHT, ignoreCollideWithTanks)) {
                    sideList.add(OrientationType.RIGHT);
                }
                if (canPass(tank, OrientationType.UP, ignoreCollideWithTanks)) {
                    back = OrientationType.UP;
                }
                break;
            case LEFT:
                if (canPass(tank, OrientationType.UP, ignoreCollideWithTanks)) {
                    sideList.add(OrientationType.UP);
                }
                if (canPass(tank, OrientationType.DOWN, ignoreCollideWithTanks)) {
                    sideList.add(OrientationType.DOWN);
                }
                if (canPass(tank, OrientationType.RIGHT, ignoreCollideWithTanks)) {
                    back = OrientationType.RIGHT;
                }
                break;
            case RIGHT:
                if (canPass(tank, OrientationType.UP, ignoreCollideWithTanks)) {
                    sideList.add(OrientationType.UP);
                }
                if (canPass(tank, OrientationType.DOWN, ignoreCollideWithTanks)) {
                    sideList.add(OrientationType.DOWN);
                }
                if (canPass(tank, OrientationType.LEFT, ignoreCollideWithTanks)) {
                    back = OrientationType.LEFT;
                }
                break;
            default:
                break;
        }

        if (!sideList.isEmpty()) {
            int index = random.nextInt(sideList.size());
            tank.setOrientationType(sideList.get(index));
            return;
        }

        //如果是因为随机掉头到这里要特殊处理
        if (forward) {
            return;
        }

        if (back != null) {
            tank.setOrientationType(back);
            return;
        }

        if (!ignoreCollideWithTanks) {
            updateTank(tank, true);
            return;
        }


        tank.setActionType(ActionType.STOP);
        if (random.nextInt(KEEP_TRY_RATE) != 0) {
            return;
        }
        tank.setOrientationType(OrientationType.convert(random.nextInt(4)));
    }

    private boolean canPass(Tank tank, OrientationType orientation, boolean ignoreCollideWithTanks) {
        //获取前方的两个角的坐标（顺时针获取）
        List<Point> corners = generateCorners(tank, orientation);
        Point corner1 = corners.get(0);
        Point corner2 = corners.get(1);
        if (!canPass(corner1.x, corner1.y, tank.getId(), ignoreCollideWithTanks)) {
            return false;
        }
        return canPass(corner2.x, corner2.y, tank.getId(), ignoreCollideWithTanks);
    }

    private List<Point> generateCorners(Tank tank, OrientationType orientation) {
        int x = (int) tank.getX();
        int y = (int) tank.getY();
        int size = CommonUtil.UNIT_SIZE;
        int halfLite = size / 2 - 1;

        //获取前方的两个角的坐标（顺时针获取）
        Point corner1 = new Point();
        Point corner2 = new Point();
        switch (orientation) {
            case UP:
                y -= tank.getSpeed();
                corner1.x = x - halfLite;
                corner1.y = y - halfLite;
                corner2.x = x + halfLite;
                corner2.y = y - halfLite;
                break;
            case DOWN:
                y += tank.getSpeed();
                corner1.x = x + halfLite;
                corner1.y = y + halfLite;
                corner2.x = x - halfLite;
                corner2.y = y + halfLite;
                break;
            case LEFT:
                x -= tank.getSpeed();
                corner1.x = x - halfLite;
                corner1.y = y + halfLite;
                corner2.x = x - halfLite;
                corner2.y = y - halfLite;
                break;
            case RIGHT:
                x += tank.getSpeed();
                corner1.x = x + halfLite;
                corner1.y = y - halfLite;
                corner2.x = x + halfLite;
                corner2.y = y + halfLite;
                break;
            default:
                break;
        }
        List<Point> corners = new ArrayList<>();
        corners.add(corner1);
        corners.add(corner2);
        return corners;
    }

    private boolean canPass(double x, double y, String tankId, boolean ignoreCollideWithTanks) {
        if (x <= 0 || y <= 0 || x >= mapDto.getWidth() || y >= mapDto.getHeight()) {
            return false;
        }

        if (collideWithMap(x, y)) {
            return false;
        }

        if (ignoreCollideWithTanks) {
            return true;
        }

        for (Map.Entry<String, Tank> kv : tankMap.entrySet()) {
            Tank tank = kv.getValue();
            if (tank.getId().equals(tankId)) {
                continue;
            }

            double distance = Point.distance(x, y, tank.getX(), tank.getY());
            if (distance <= CommonUtil.UNIT_SIZE) {
                return false;
            }
        }
        return true;
    }

    private boolean collideWithMap(double x, double y) {
        String key = CommonUtil.generateGridKey(x, y);
        if (!unitMap.containsKey(key)) {
            return false;
        }

        return unitMap.get(key) != MapUnitType.GRASS;
    }
}
