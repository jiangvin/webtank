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
    private List<String> loadedMapIds = new ArrayList<>();

    public MapMangerBo(MapService mapService, String mapId, RoomType roomType) {
        this.mapService = mapService;
        this.roomType = roomType;
        this.mapBo = mapService.loadMap(mapId, roomType);
        this.loadedMapIds.add(mapBo.getMapId());
    }

    public boolean loadNextMap() {
        MapBo mapBo = mapService.loadNextMap(loadedMapIds, roomType);
        if (mapBo == null) {
            return false;
        }
        this.mapBo = mapBo;
        this.loadedMapIds.add(mapBo.getMapId());
        return true;
    }

    public boolean reload() {
        MapBo mapBo = mapService.loadMap(loadedMapIds.get(loadedMapIds.size() - 1), roomType);
        if (mapBo == null) {
            return false;
        }
        this.mapBo = mapBo;
        return true;
    }
}
