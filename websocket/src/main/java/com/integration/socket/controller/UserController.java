package com.integration.socket.controller;

import com.integration.socket.model.dto.RankDto;
import com.integration.socket.model.dto.UserDto;
import com.integration.socket.service.OnlineUserService;
import com.integration.socket.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
    private UserService userService;

    @GetMapping("/getUsers")
    public List<String> getUsers() {
        return onlineUserService.getUserList();
    }

    @GetMapping("/getUser")
    public UserDto getUser(@RequestParam(value = "userId") String userId) {
        return userService.queryUser(userId);
    }

    @PostMapping("/saveUser")
    public boolean saveUser(@RequestBody UserDto userDto) {
        userService.saveUser(userDto);
        return true;
    }

    @GetMapping("/getRankList")
    public List<RankDto> getRankList(@RequestParam(value = "start") int start,
                                     @RequestParam(value = "limit") int limit) {
        return userService.getRankList(start, limit);
    }

}
