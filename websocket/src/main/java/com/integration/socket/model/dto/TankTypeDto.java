package com.integration.socket.model.dto;

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
public class TankTypeDto {
    private String typeId;
    private double speed;

    private int ammoMaxCount;
    private double ammoSpeed;
    private int ammoMaxLifeTime;
    private int ammoReloadTime;
    private boolean brokenIron;

    private String downId;
    private String upId;

    private static ConcurrentHashMap<String, TankTypeDto> tankTypeMap;

    public static TankTypeDto getTankType(String id) {
        ConcurrentHashMap<String, TankTypeDto> map = getTypeMap();

        if (!map.containsKey(id)) {
            throw new CustomException(String.format("tank type:%s can not be found! ", id));
        }
        return map.get(id);
    }

    public static ConcurrentHashMap<String, TankTypeDto> getTypeMap() {
        if (tankTypeMap == null) {
            initTypeMap();
        }
        return tankTypeMap;
    }

    private static void initTypeMap() {
        tankTypeMap = new ConcurrentHashMap<>(16);

        //player
        tankTypeMap.put("tank01", new TankTypeDto(
                            "tank01",
                            1.5,
                            1,
                            6.0,
                            60,
                            0,
                            false,
                            null,
                            "tank02"));
        tankTypeMap.put("tank02", new TankTypeDto(
                            "tank02",
                            2.0,
                            1,
                            7.5,
                            60,
                            0,
                            false,
                            null,
                            "tank03"));
        tankTypeMap.put("tank03", new TankTypeDto(
                            "tank03",
                            2.5,
                            2,
                            9.0,
                            60,
                            0,
                            false,
                            "tank01",
                            "tank04"));
        tankTypeMap.put("tank04", new TankTypeDto(
                            "tank04",
                            2.5,
                            2,
                            9.0,
                            60,
                            0,
                            true,
                            "tank02",
                            null));

        //computer
        initComType();
    }

    private static void initComType() {
        TankTypeDto com = comCopyType(
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
                  40,
                  null,
                  null);
        tankTypeMap.put(com.getTypeId(), com);

        com = comCopyType(
                  "tank07",
                  "tank02",
                  2.0,
                  35,
                  null,
                  null);
        com.brokenIron = true;
        tankTypeMap.put(com.getTypeId(), com);

        com = comCopyType(
                  "tank08",
                  "tank03",
                  3.0,
                  35,
                  null,
                  null);
        com.setAmmoMaxCount(3);
        tankTypeMap.put(com.getTypeId(), com);

        com = comCopyType(
                  "tank09",
                  "tank04",
                  2.0,
                  60,
                  null,
                  "tank10");
        com.setAmmoMaxCount(1);
        tankTypeMap.put(com.getTypeId(), com);

        com = comCopyType(
                  "tank10",
                  "tank04",
                  2.5,
                  45,
                  null,
                  "tank11");
        tankTypeMap.put(com.getTypeId(), com);

        com = comCopyType(
                  "tank11",
                  "tank03",
                  3.0,
                  35,
                  null,
                  "tank12");
        tankTypeMap.put(com.getTypeId(), com);

        com = comCopyType(
                  "tank12",
                  "tank03",
                  4.0,
                  35,
                  null,
                  null);
        tankTypeMap.put(com.getTypeId(), com);
    }

    private static TankTypeDto comCopyType(String newId,
                                           String oldId,
                                           Double speed,
                                           int ammoReloadTime,
                                           String upId,
                                           String downId) {
        TankTypeDto com = new TankTypeDto();
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
