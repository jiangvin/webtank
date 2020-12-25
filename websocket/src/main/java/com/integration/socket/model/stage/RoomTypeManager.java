package com.integration.socket.model.stage;

import com.integration.socket.model.ItemType;
import com.integration.socket.model.bo.UserBo;

import java.util.Arrays;
import java.util.Map;

/**
 * @author 蒋文龙(Vin)
 * @description 提供不同RoomType的差异化支援
 * @date 2020/12/25
 */
class RoomTypeManager {
    private StageRoom room;

    RoomTypeManager(StageRoom room) {
        this.room = room;
    }

    void initItemPool() {
        switch (room.getRoomType()) {
            case PVP:
                initItemPoolPvp();
                break;
            default:
                initItemPoolPve();
                break;
        }
    }

    private void initItemPoolPvp() {
        room.itemTypePool.clear();
        room.itemTypePool.addAll(Arrays.asList(ItemType.values()));
        room.itemTypePool.remove(ItemType.KING);
    }

    private void initItemPoolPve() {
        room.itemTypePool.clear();
        room.itemTypePool.addAll(Arrays.asList(ItemType.values()));
        boolean hasRedStar = false;
        boolean hasGhost = false;
        boolean hasClock = false;
        for (Map.Entry<String, UserBo> kv : room.userMap.entrySet()) {
            UserBo user = kv.getValue();
            if (!hasRedStar && user.hasRedStar()) {
                hasRedStar = true;
            }
            if (!hasGhost && user.hasGhost()) {
                hasGhost = true;
            }
            if (!hasClock && user.hasClock()) {
                hasClock = true;
            }
            if (hasRedStar && hasGhost && hasClock) {
                break;
            }
        }

        if (!hasRedStar) {
            room.itemTypePool.remove(ItemType.RED_STAR);
        }
        if (!hasGhost) {
            room.itemTypePool.remove(ItemType.GHOST);
        }
        if (!hasClock) {
            room.itemTypePool.remove(ItemType.CLOCK);
        }
    }
}
