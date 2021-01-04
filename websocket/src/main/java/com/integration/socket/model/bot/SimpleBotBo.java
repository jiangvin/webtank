package com.integration.socket.model.bot;

import com.integration.dto.bot.BotType;
import com.integration.dto.map.ActionType;
import com.integration.dto.map.OrientationType;
import com.integration.socket.model.CollideType;
import com.integration.socket.model.bo.TankBo;
import lombok.Data;
import lombok.NonNull;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/8
 */
class SimpleBotBo extends BaseBotBo {

    /**
     * x-1 / x 的概率继续前进
     */
    private static final int KEEP_GOING_RATE = 120;

    /**
     * 阻塞的时候 x-1 / x的概率不动
     */
    private static final int KEEP_TRY_RATE = 30;

    @Data
    static class ControlCache {
        @NonNull ActionType action;
        @NonNull OrientationType orientation;
    }

    private Random random = new Random();

    SimpleBotBo() {
        super();
        setBotType(BotType.SIMPLE);
    }

    @Override
    void updateExtension() {
        for (Map.Entry<String, TankBo> kv : getStage().getTankMap().entrySet()) {
            TankBo tank = kv.getValue();

            ControlCache controlCache = new ControlCache(tank.getActionType(), tank.getOrientationType());
            updateTank(tank);
            addToSyncList(tank, controlCache);
        }
    }

    private void addToSyncList(TankBo tank, ControlCache controlCache) {
        if (tank.getActionType() != controlCache.getAction() || tank.getOrientationType() != controlCache.getOrientation()) {
            getStage().getSyncTankList().add(tank);
        }
    }

    private void updateTank(TankBo tank) {
        if (!tank.getUserId().equals(getBotUser().getUsername())) {
            return;
        }

        updateFire(tank);

        tank.setActionType(ActionType.RUN);
        boolean forward = getStage().canPass(tank) == CollideType.COLLIDE_NONE;
        if (forward && random.nextInt(KEEP_GOING_RATE) != 0) {
            return;
        }

        List<OrientationType> sideList = new ArrayList<>();
        if (tank.getOrientationType() == OrientationType.UP || tank.getOrientationType() == OrientationType.DOWN) {
            if (getStage().canPass(tank, OrientationType.LEFT) == CollideType.COLLIDE_NONE) {
                sideList.add(OrientationType.LEFT);
            }
            if (getStage().canPass(tank, OrientationType.RIGHT) == CollideType.COLLIDE_NONE) {
                sideList.add(OrientationType.RIGHT);
            }
        } else {
            if (getStage().canPass(tank, OrientationType.UP) == CollideType.COLLIDE_NONE) {
                sideList.add(OrientationType.UP);
            }
            if (getStage().canPass(tank, OrientationType.DOWN) == CollideType.COLLIDE_NONE) {
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
        if (getStage().canPass(tank, back) != CollideType.COLLIDE_NONE) {
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

    private void updateFire(TankBo tank) {
        if (tank.getBulletCount() > 0 && tank.getReloadTime() <= 0) {
            getStage().processTankFire(tank.getTankId(), getBotUser().getUsername());
        }
    }
}
