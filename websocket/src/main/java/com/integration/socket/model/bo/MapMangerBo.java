package com.integration.socket.model.bo;

import com.integration.dto.room.RoomType;
import com.integration.socket.service.MapService;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/15
 */

@Data
public class MapMangerBo {
    private MapService mapService;
    private MapBo mapBo;
    private RoomType roomType;

    /**
     * 加载过的地图
     */
    List<String> loadedMapNames = new ArrayList<>();

    private int mapId;

    private int subId;

    public MapMangerBo(MapService mapService, int mapId, int subId, RoomType roomType) {
        this.mapService = mapService;
        this.roomType = roomType;
        if (roomType == RoomType.PVE) {
            this.mapBo = mapService.loadMap(mapId, subId, roomType);
        } else {
            this.mapBo = mapService.loadRandomMap(loadedMapNames, roomType);
        }
        this.mapId = mapBo.getMapId();
        this.subId = mapBo.getSubId();
    }

    public boolean loadNextMapPve(int saveLife) {
        MapBo mapBo = mapService.loadNextMap(mapId, ++subId, roomType);
        if (mapBo == null) {
            return false;
        }

        //继承之前的属性
        this.mapBo.addPlayerLife(saveLife);
        mapBo.setPlayerLife(this.mapBo.getPlayerLife());

        this.mapBo = mapBo;
        return true;
    }

    public boolean loadRandomMapPvp() {
        MapBo mapBo = mapService.loadRandomMap(this.loadedMapNames, roomType);
        if (mapBo == null) {
            return false;
        }
        this.mapBo = mapBo;
        this.mapId = mapBo.getMapId();
        this.subId = mapBo.getSubId();
        return true;
    }

    public boolean reload() {
        MapBo mapBo = mapService.loadMap(mapId, subId, roomType);
        if (mapBo == null) {
            return false;
        }

        this.mapBo = mapBo;
        return true;
    }
}
