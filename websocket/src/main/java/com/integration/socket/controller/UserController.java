package com.integration.socket.controller;

import com.integration.socket.model.dto.RoomListDto;
import com.integration.socket.service.GameService;
import com.integration.socket.service.OnlineUserService;
import com.integration.util.model.CustomException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
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
    private GameService gameService;

    @GetMapping("/getUsers")
    public List<String> getUsers() {
        return onlineUserService.getUserList();
    }

    @GetMapping("/checkName")
    public boolean checkName(@RequestParam(value = "name") String name) {
        if (onlineUserService.exists(name)) {
            throw new CustomException("输入的名字重复: " + name);
        }
        return true;
    }

    @GetMapping("/getRooms")
    public RoomListDto getRooms(@RequestParam(value = "start", defaultValue = "0") int start,
                                @RequestParam(value = "limit", defaultValue = "5") int limit) {
        return gameService.getRoomListDto(start, limit);
    }

    @GetMapping("/getMaps")
    public List<String> getMaps() {
        return Collections.singletonList("default");
    }

    @GetMapping("/checkRoomName")
    public boolean checkRoomName(@RequestParam(value = "name") String name) {
        if (gameService.roomNameExists(name)) {
            throw new CustomException("输入的房间号重复: " + name);
        }
        return true;
    }
}
