package com.integration.socket.model.bo;

import com.integration.socket.model.MapUnitType;
import com.integration.util.model.CustomException;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/10
 */

@Data
public class MapBo {
    private int playerLife = 0;

    private int computerStartCount = 0;

    private int width;

    private int height;

    private int maxGridX;

    private int maxGridY;

    private ConcurrentHashMap<String, Integer> computerLife = new ConcurrentHashMap<>();

    private ConcurrentHashMap<String, MapUnitType> unitMap = new ConcurrentHashMap<>();

    private List<String> playerStartPoints = new ArrayList<>();

    private List<String> computerStartPoints = new ArrayList<>();

    public void checkSelf() {
        if (width == 0 || height == 0) {
            throw new CustomException("宽高不能为空");
        }

        if (playerLife == 0) {
            throw new CustomException("玩家生命不能为0");
        }
        if (computerStartCount == 0) {
            throw new CustomException("初始的电脑数量不能为0");
        }
        if (computerLife.isEmpty()) {
            throw new CustomException("电脑类型不能为空");
        }
        if (playerStartPoints.isEmpty()) {
            throw new CustomException("玩家出生点不能为空");
        }
        if (computerStartPoints.isEmpty()) {
            throw new CustomException("电脑出生点不能为空");
        }
    }
}
