package com.integration.socket.model.bo;

import com.integration.util.model.CustomException;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.BeanUtils;

import java.util.concurrent.ConcurrentHashMap;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/8
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TankTypeBo {
    private String typeId;
    private double speed;

    private int ammoCount;
    private double ammoSpeed;
    private int ammoLifeTime;
    private int ammoReloadTime;
    private boolean brokenIron;

    private String downId;
    private String upId;

    private static ConcurrentHashMap<String, TankTypeBo> tankTypeMap;

    public static TankTypeBo getTankType(String id) {
        ConcurrentHashMap<String, TankTypeBo> map = getTypeMap();

        if (!map.containsKey(id)) {
            throw new CustomException(String.format("tank type:%s can not be found! ", id));
        }
        return map.get(id);
    }

    private static ConcurrentHashMap<String, TankTypeBo> getTypeMap() {
        if (tankTypeMap == null) {
            initTypeMap();
        }
        return tankTypeMap;
    }

    private static void initTypeMap() {
        tankTypeMap = new ConcurrentHashMap<>(16);

        //menu
        tankTypeMap.put("tankMenu", new TankTypeBo(
                            "tankMenu",
                            1.0,
                            1,
                            5.0,
                            60,
                            0,
                            false,
                            null,
                            null));

        //player
        tankTypeMap.put("tank01", new TankTypeBo(
                            "tank01",
                            1.0,
                            1,
                            5.0,
                            300,
                            0,
                            false,
                            null,
                            "tank02"));
        tankTypeMap.put("tank02", new TankTypeBo(
                            "tank02",
                            2.0,
                            1,
                            10.0,
                            300,
                            0,
                            false,
                            null,
                            "tank03"));
        tankTypeMap.put("tank03", new TankTypeBo(
                            "tank03",
                            2.0,
                            2,
                            10.0,
                            300,
                            0,
                            false,
                            "tank01",
                            "tank04"));
        tankTypeMap.put("tank04", new TankTypeBo(
                            "tank04",
                            2.0,
                            2,
                            10.0,
                            300,
                            0,
                            true,
                            "tank02",
                            null));

        //computer
        initComType();
    }

    private static void initComType() {
        TankTypeBo com = comCopyType(
                             "tank05",
                             "tank01",
                             null,
                             60,
                             "tank06",
                             null);
        tankTypeMap.put(com.getTypeId(), com);

        com = comCopyType(
                  "tank06",
                  "tank02",
                  null,
                  60,
                  null,
                  null);
        tankTypeMap.put(com.getTypeId(), com);

        com = comCopyType(
                  "tank07",
                  "tank02",
                  3.0,
                  60,
                  null,
                  null);
        tankTypeMap.put(com.getTypeId(), com);

        com = comCopyType(
                  "tank08",
                  "tank03",
                  2.5,
                  20,
                  null,
                  null);
        tankTypeMap.put(com.getTypeId(), com);

        com = comCopyType(
                  "tank09",
                  "tank04",
                  2.5,
                  30,
                  null,
                  "tank10");
        tankTypeMap.put(com.getTypeId(), com);

        com = comCopyType(
                  "tank10",
                  "tank04",
                  null,
                  50,
                  null,
                  "tank11");
        tankTypeMap.put(com.getTypeId(), com);

        com = comCopyType(
                  "tank11",
                  "tank03",
                  null,
                  60,
                  null,
                  "tank12");
        tankTypeMap.put(com.getTypeId(), com);

        com = comCopyType(
                  "tank12",
                  "tank02",
                  null,
                  60,
                  null,
                  null);
        tankTypeMap.put(com.getTypeId(), com);
    }

    private static TankTypeBo comCopyType(String newId,
                                          String oldId,
                                          Double speed,
                                          int ammoReloadTime,
                                          String upId,
                                          String downId) {
        TankTypeBo com = new TankTypeBo();
        BeanUtils.copyProperties(tankTypeMap.get(oldId), com);
        com.ammoReloadTime = ammoReloadTime;
        com.typeId = newId;
        if (speed != null) {
            com.speed = speed;
        }
        com.upId = upId;
        com.downId = downId;
        return com;
    }
}
