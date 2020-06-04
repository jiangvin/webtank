package com.integration.socket.model.bo;

import com.integration.dto.room.RoomType;
import com.integration.socket.model.dto.StringCountDto;
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
    private int mapId;

    public MapMangerBo(MapService mapService, int mapId, RoomType roomType) {
        this.mapService = mapService;
        this.roomType = roomType;
        this.mapBo = mapService.loadMap(mapId, roomType);
        initPlayerLife();
        this.mapId = mapId;
    }

    public boolean loadNextMap() {
        List<StringCountDto> lastPlayerLife = mapBo.getPlayerLife();
        MapBo mapBo = mapService.loadNextMap(++mapId, roomType);
        if (mapBo == null) {
            return false;
        }

        //继承之前的属性
        if (roomType == RoomType.PVE) {
            mapBo.setPlayerLife(lastPlayerLife);
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
        initPlayerLife();
        return true;
    }

    private static List<StringCountDto> initPlayerLifeInPve() {
        List<StringCountDto> list = new ArrayList<>();
        list.add(new StringCountDto("tank01", 5));
        return list;
    }

    private void initPlayerLife() {
        if (roomType != RoomType.PVE) {
            return;
        }
        this.mapBo.setPlayerLife(initPlayerLifeInPve());
    }
}
