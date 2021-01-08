package com.integration.socket.controller;

import com.integration.socket.model.dto.RoomListDto;
import com.integration.socket.service.OnlineUserService;
import com.integration.socket.service.RoomService;
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

    private static final int NAME_START = 2;
    private static final int NAME_LIMIT = 99;
    private int roomId = 1;

    @Autowired
    private OnlineUserService onlineUserService;

    @Autowired
    private RoomService roomService;

    /**
     * 获得用户的连接名
     * @param name
     * @return
     */
    @GetMapping("/getConnectName")
    public String getNetName(@RequestParam(value = "name") String name) {
        if (!onlineUserService.exists(name)) {
            return name;
        }

        for (int i = NAME_START; i <= NAME_LIMIT; ++i) {
            String newName = String.format("%s(%d)", name, i);
            if (!onlineUserService.exists(newName)) {
                return newName;
            }
        }

        return CommonUtil.getId();
    }

    @GetMapping("/getRoomId")
    public String getRoomId() {
        for (int i = NAME_START; i <= NAME_LIMIT; ++i) {
            String newRoomId = String.format("%03d", this.roomId++);
            if (!roomService.roomIdExists(newRoomId)) {
                return newRoomId;
            }
        }

        return CommonUtil.getId();
    }

    @GetMapping("/getRooms")
    public RoomListDto getRooms(@RequestParam(value = "start", defaultValue = "0") int start,
                                @RequestParam(value = "limit", defaultValue = "5") int limit,
                                @RequestParam(value = "search", required = false) String search) {
        return roomService.getRoomListDto(start, limit, search);
    }
}
