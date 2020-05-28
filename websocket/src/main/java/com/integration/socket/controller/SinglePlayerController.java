package com.integration.socket.controller;

import com.integration.dto.map.MapDto;
import com.integration.dto.room.RoomType;
import com.integration.socket.service.MapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
    public MapDto getMapFromId(@RequestParam(value = "id") String id,
                               @RequestParam(value = "roomType") RoomType roomType) {
        return mapService.loadMap(id, roomType).convertToDto();
    }
}
