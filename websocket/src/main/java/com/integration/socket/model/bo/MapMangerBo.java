package com.integration.socket.model.bo;

import com.integration.dto.room.RoomType;
import com.integration.socket.service.MapService;
import lombok.Data;

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
    private int mapId;

    public MapMangerBo(MapService mapService, int mapId, RoomType roomType) {
        this.mapService = mapService;
        this.roomType = roomType;
        this.mapBo = mapService.loadMap(mapId, roomType);
        this.mapId = mapId;
    }

    public boolean loadNextMap() {
        MapBo mapBo = mapService.loadNextMap(++mapId, roomType);
        if (mapBo == null) {
            return false;
        }
        this.mapBo = mapBo;
        return true;
    }

    public boolean reload() {
        MapBo mapBo = mapService.loadMap(mapId, roomType);
        if (mapBo == null) {
            return false;
        }
        this.mapBo = mapBo;
        return true;
    }
}
