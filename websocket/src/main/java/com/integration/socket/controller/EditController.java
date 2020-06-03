package com.integration.socket.controller;

import com.integration.socket.model.dto.MapEditDto;
import com.integration.socket.repository.dao.MapDao;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/getMapFromName/{name}")
    public MapEditDto getMap(@PathVariable(value = "name") String name) {
        return MapEditDto.convert(mapDao.queryFromName(name));
    }

}
