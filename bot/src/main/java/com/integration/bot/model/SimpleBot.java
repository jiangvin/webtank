package com.integration.bot.model;

import com.integration.bot.model.map.Tank;
import com.integration.dto.bot.RequestBotDto;
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

    private static final int KEEP_GOING_RATE = 20;

    private Random random = new Random();

    @Override
    void updateExtension() {
        for (Map.Entry<String, Tank> kv : tankMap.entrySet()) {
            updateTank(kv.getValue());
            kv.getValue().run();
        }
    }

    private void updateTank(Tank tank) {
        if (!tank.getUserId().equals(name)) {
            return;
        }

        if (tank.getBulletCount() != 0 && tank.getReloadTime() == 0) {
            sendMessage(new MessageDto(tank.getId(), MessageType.UPDATE_TANK_FIRE));
        }

        List<OrientationType> orientationList = new ArrayList<>();
        if (canPass(tank.getX(), tank.getY() - tank.getSpeed(), tank.getId())) {
            orientationList.add(OrientationType.UP);
        }
        if (canPass(tank.getX(), tank.getY() + tank.getSpeed(), tank.getId())) {
            orientationList.add(OrientationType.DOWN);
        }
        if (canPass(tank.getX() - tank.getSpeed(), tank.getY(), tank.getId())) {
            orientationList.add(OrientationType.LEFT);
        }
        if (canPass(tank.getX() + tank.getSpeed(), tank.getY(), tank.getId())) {
            orientationList.add(OrientationType.RIGHT);
        }

        if (orientationList.isEmpty()) {
            return;
        }

        if (tank.getActionType() == ActionType.RUN
                && orientationList.contains(tank.getOrientationType())
                && random.nextInt(KEEP_GOING_RATE) != 0) {
            //keep going
            return;
        }

        int index = random.nextInt(orientationList.size());
        tank.setOrientationType(orientationList.get(index));
        tank.setActionType(ActionType.RUN);
        sendTankControl(tank);
    }

    private boolean canPass(double x, double y, String tankId) {
        if (x < 0 || y < 0 || x > mapDto.getWidth() || y > mapDto.getHeight()) {
            return false;
        }

        if (collideWithMap(x, y)) {
            return false;
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
