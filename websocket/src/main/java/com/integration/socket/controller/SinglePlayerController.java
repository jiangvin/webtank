package com.integration.socket.controller;

import com.integration.dto.room.RoomType;
import com.integration.socket.model.dto.EncryptDto;
import com.integration.socket.model.dto.MapDetailDto;
import com.integration.socket.model.dto.RankDto;
import com.integration.socket.model.dto.TankTypeDto;
import com.integration.socket.model.dto.UserDto;
import com.integration.socket.repository.dao.MapDao;
import com.integration.socket.service.MapService;
import com.integration.socket.service.UserService;
import com.integration.util.object.ObjectUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    @Autowired
    private MapDao mapDao;

    @Autowired
    private UserService userService;

    @GetMapping("/getMapFromId")
    public MapDetailDto getMapFromId(@RequestParam(value = "id") int id, @RequestParam(value = "subId") int subId) {
        return mapService.loadMap(id, subId, RoomType.PVE).toDetailDto();
    }

    @GetMapping("getTankTypes")
    public Map<String, TankTypeDto> getTankTypes() {
        return TankTypeDto.getTypeMap();
    }

    @GetMapping("getMaxSubId")
    public int getMaxSubId(@RequestParam(value = "id") int id) {
        return mapDao.queryMaxSubId(id);
    }

    @GetMapping("/getRank")
    public int getRank(@RequestParam(value = "score") int score) {
        return userService.getRank(score);
    }

    @PostMapping("/saveRank")
    public boolean saveRank(@RequestParam("username") String username,
                            @RequestBody EncryptDto encryptDto) {
        RankDto rankDto = ObjectUtil.readValue(encryptDto.decrypt(), RankDto.class);
        if (rankDto == null) {
            return false;
        }
        //账号名如果是表情则会出现乱码，所以这里账号名单独传递
        rankDto.setUsername(username);

        userService.saveRankForSinglePlayer(rankDto);
        return true;
    }

    @PostMapping("/saveStage")
    public UserDto saveStage(@RequestBody EncryptDto encryptDto) {
        UserDto userDto = ObjectUtil.readValue(encryptDto.decrypt(), UserDto.class);
        if (userDto == null || StringUtils.isEmpty(userDto.getUserId())) {
            return null;
        }

        return userService.saveStageForSinglePlayer(userDto);
    }
}
