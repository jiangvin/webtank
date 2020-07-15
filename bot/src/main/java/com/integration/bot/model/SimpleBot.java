package com.integration.bot.model;

import com.integration.dto.bot.BotDto;
import com.integration.bot.model.map.Tank;
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
    public SimpleBot(BotDto botDto) {
        super(botDto);
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
     * 发射子弹有一秒延迟
     */
    private static final int COMMON_RELOAD_TIME = 60;

    private Random random = new Random();

    @Override
    void updateExtension() {
        for (Map.Entry<String, Tank> kv : tankMap.entrySet()) {
            Tank tank = kv.getValue();
            updateTank(tank);
            syncTank(tank);
        }
    }

    private void updateTank(Tank tank) {
        if (!tank.getUserId().equals(name)) {
            return;
        }

        updateFire(tank);

        tank.setActionType(ActionType.RUN);
        boolean forward = canPass(tank, tank.getOrientationType());
        if (forward && random.nextInt(KEEP_GOING_RATE) != 0) {
            return;
        }

        List<OrientationType> sideList = new ArrayList<>();
        if (tank.getOrientationType() == OrientationType.UP || tank.getOrientationType() == OrientationType.DOWN) {
            if (canPass(tank, OrientationType.LEFT)) {
                sideList.add(OrientationType.LEFT);
            }
            if (canPass(tank, OrientationType.RIGHT)) {
                sideList.add(OrientationType.RIGHT);
            }
        } else {
            if (canPass(tank, OrientationType.UP)) {
                sideList.add(OrientationType.UP);
            }
            if (canPass(tank, OrientationType.DOWN)) {
                sideList.add(OrientationType.DOWN);
            }
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

        OrientationType back = tank.getOrientationType().getBack();
        if (!canPass(tank, back)) {
            back = null;
        }

        if (back != null) {
            tank.setOrientationType(back);
            return;
        }

        tank.setActionType(ActionType.STOP);
        if (random.nextInt(KEEP_TRY_RATE) != 0) {
            return;
        }
        tank.setOrientationType(OrientationType.convert(random.nextInt(4)));
    }

    private void updateFire(Tank tank) {
        if (tank.getBulletCount() > 0 && tank.getReloadTime() <= 0) {
            sendMessage(new MessageDto(tank.getId(), MessageType.UPDATE_TANK_FIRE));
            tank.setReloadTime(COMMON_RELOAD_TIME);
        }
    }

    private boolean canPass(Tank tank, OrientationType orientation) {
        if (!tank.isHasGhost() && collideWithTanks(tank, orientation)) {
            return false;
        }

        //获取前方的两个角的坐标（顺时针获取）
        List<Point> corners = generateCorners(tank, orientation);
        Point corner1 = corners.get(0);
        Point corner2 = corners.get(1);
        if (!canPass(corner1.x, corner1.y, tank.isHasGhost())) {
            return false;
        }
        return canPass(corner2.x, corner2.y, tank.isHasGhost());
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

    private boolean canPass(double x, double y, boolean isGhost) {
        if (x < 0 || y < 0 || x >= mapDto.getWidth() || y >= mapDto.getHeight()) {
            return false;
        }

        //幽灵状态无视一切障碍
        if (isGhost) {
            return true;
        }

        return !collideWithMap(x, y);
    }

    private boolean collideWithTanks(Tank tank, OrientationType orientation) {
        for (Map.Entry<String, Tank> kv : tankMap.entrySet()) {
            Tank target = kv.getValue();
            if (target.getId().equals(tank.getId())) {
                continue;
            }

            double distance = Point.distance(tank.getX(), tank.getY(), target.getX(), target.getY());
            if (distance <= CommonUtil.UNIT_SIZE) {
                switch (orientation) {
                    case UP:
                        if (tank.getY() > target.getY()) {
                            return true;
                        }
                        break;
                    case DOWN:
                        if (tank.getY() < target.getY()) {
                            return true;
                        }
                        break;
                    case LEFT:
                        if (tank.getX() > target.getX()) {
                            return true;
                        }
                        break;
                    case RIGHT:
                        if (tank.getX() < target.getX()) {
                            return true;
                        }
                        break;
                    default:
                        break;
                }
            }
        }
        return false;
    }

    private boolean collideWithMap(double x, double y) {
        String key = CommonUtil.generateGridKey(x, y);
        if (!unitMap.containsKey(key)) {
            return false;
        }

        return unitMap.get(key) != MapUnitType.GRASS;
    }
}
