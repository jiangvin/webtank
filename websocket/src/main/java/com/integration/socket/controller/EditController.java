package com.integration.socket.controller;

import com.integration.socket.model.dto.MapEditDto;
import com.integration.socket.repository.dao.MapDao;
import com.integration.socket.service.MapService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/3
 */

@RestController
@RequestMapping("edit")
@Slf4j
public class EditController {
    @Autowired
    private MapDao mapDao;

    @Autowired
    private MapService mapService;

    @GetMapping("/getMapFromName/{name}")
    public MapEditDto getMap(@PathVariable(value = "name") String name) {
        return MapEditDto.convert(mapDao.queryFromName(name));
    }

    @GetMapping("/getMaps")
    public List<String> getMaps() {
        return mapDao.queryMapNameList();
    }

    @PostMapping("/setMap")
    public boolean setMap(MapEditDto mapEditDto) {
        mapService.saveMap(mapEditDto);
        return true;
    }

}
