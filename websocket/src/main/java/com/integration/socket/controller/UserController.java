package com.integration.socket.controller;

import com.integration.socket.model.dto.MapEditDto;
import com.integration.socket.repository.dao.MapDao;
import com.integration.socket.service.MapService;
import com.integration.socket.service.OnlineUserService;
import com.integration.socket.service.RoomService;
import com.integration.util.model.CustomException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/1
 */

@RestController
@RequestMapping("user")
@Slf4j
public class UserController {

    @Autowired
    private OnlineUserService onlineUserService;

    @Autowired
    private RoomService roomService;

    @Autowired
    private MapDao mapDao;

    @Autowired
    private MapService mapService;

    @GetMapping("/getUsers")
    public List<String> getUsers() {
        return onlineUserService.getUserList();
    }

    @GetMapping("/checkRoomName")
    public boolean checkRoomName(@RequestParam(value = "name") String name) {
        if (roomService.roomNameExists(name)) {
            throw new CustomException("输入的房间号重复: " + name);
        }
        return true;
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
