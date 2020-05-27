package com.integration.socket.controller;

import com.integration.dto.map.MapDto;
import com.integration.dto.message.MessageDto;
import com.integration.dto.message.MessageType;
import com.integration.dto.room.RoomType;
import com.integration.socket.model.dto.MapEditDto;
import com.integration.socket.model.dto.RoomListDto;
import com.integration.socket.repository.dao.MapDao;
import com.integration.socket.service.MapService;
import com.integration.socket.service.OnlineUserService;
import com.integration.socket.service.RoomService;
import com.integration.util.model.CustomException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    @Value("${bot.host:localhost}")
    private String botHost;

    @Autowired
    private OnlineUserService onlineUserService;

    @Autowired
    private RoomService roomService;

    @Autowired
    private MapDao mapDao;

    @Autowired
    private MapService mapService;

    @GetMapping("/ping")
    public MessageDto ping() {
        return new MessageDto("Hello World", MessageType.SYSTEM_MESSAGE, "Player");
    }

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
        return roomService.getRoomListDto(start, limit);
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
        return mapDao.queryMapIdList();
    }

    @GetMapping("/getMap/{id}")
    public MapEditDto getMap(@PathVariable(value = "id") String id) {
        return MapEditDto.convert(mapDao.queryFromId(id));
    }

    @GetMapping("/getMapFromIndex")
    public MapDto getMapFromIndex(@RequestParam(value = "index") int index,
                                  @RequestParam(value = "roomType") RoomType roomType) {
        return mapService.loadMapFromIndex(index, roomType).convertToDto();
    }

    @GetMapping("/getBotAddress")
    public String getBotAddress() {
        return String.format("http://%s:8200/requestBot", this.botHost);
    }

    @PostMapping("/setMap")
    public boolean setMap(MapEditDto mapEditDto) {
        mapService.saveMap(mapEditDto);
        return true;
    }

}
