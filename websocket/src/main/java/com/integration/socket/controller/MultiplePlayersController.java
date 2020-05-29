package com.integration.socket.controller;

import com.integration.socket.service.OnlineUserService;
import com.integration.util.CommonUtil;
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
@RequestMapping("multiplePlayers")
public class MultiplePlayersController {

    @Autowired
    private OnlineUserService onlineUserService;

    @GetMapping("/getUserId")
    public String getUserId(@RequestParam(value = "userId") String userId) {
        if (!onlineUserService.exists(userId)) {
            return userId;
        }

        for (int i = 2; i < 100; ++i) {
            String newId = String.format("%s(%d)", userId, i);
            if (!onlineUserService.exists(newId)) {
                return newId;
            }
        }

        return CommonUtil.getId();
    }

}
