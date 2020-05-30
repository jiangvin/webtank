package com.integration.socket.controller;

import com.integration.dto.room.RoomType;
import com.integration.socket.model.dto.MapDetailDto;
import com.integration.socket.model.dto.TankTypeDto;
import com.integration.socket.service.MapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/28
 */

@RestController
@RequestMapping("/singlePlayer")
public class SinglePlayerController {

    @Autowired
    private MapService mapService;

    @GetMapping("/getMapFromId")
    public MapDetailDto getMapFromId(@RequestParam(value = "id") String id) {
        return mapService.loadMap(id, RoomType.PVE).toDetailDto();
    }

    @GetMapping("getTankTypes")
    public Map<String, TankTypeDto> getTankTypes() {
        return TankTypeDto.getTypeMap();
    }
}
