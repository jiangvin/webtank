package com.integration.socket.service;

import com.integration.dto.room.RoomDto;
import com.integration.socket.model.bo.MapMangerBo;
import com.integration.socket.model.bo.UserBo;
import com.integration.socket.model.dto.RoomListDto;
import com.integration.socket.model.stage.StageRoom;
import com.integration.util.model.CustomException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/6
 */

@Service
@Slf4j
public class RoomService {
    private ConcurrentHashMap<String, StageRoom> roomMap = new ConcurrentHashMap<>();

    @Autowired
    private MessageService messageService;

    @Autowired
    private MapService mapService;

    @Autowired
    private UserService userService;

    /**
     * 新增List来保证rooms的顺序
     * 顺序 旧 -> 新
     */
    private List<StageRoom> roomList = new ArrayList<>();

    void remove(StageRoom room) {
        roomMap.remove(room.getRoomId());
        roomList.remove(room);
    }

    public boolean roomNameExists(String roomName) {
        return roomMap.containsKey(roomName);
    }

    public RoomListDto getRoomListDto(int start, int limit, String search) {
        List<RoomDto> roomDtoList = new ArrayList<>();
        for (StageRoom room : roomList) {
            if (!StringUtils.isEmpty(search) && !room.getRoomId().contains(search)) {
                continue;
            }
            roomDtoList.add(room.toDto());
        }
        if (start >= roomDtoList.size()) {
            return new RoomListDto(new ArrayList<>(), roomDtoList.size());
        }
        if (limit > roomDtoList.size() - start) {
            limit = roomDtoList.size() - start;
        }
        return new RoomListDto(roomDtoList.subList(start, limit), roomDtoList.size());
    }

    @Scheduled(fixedRate = 16)
    public void update() {
        for (StageRoom room : roomList) {
            room.update();
        }
    }

    StageRoom get(String roomName) {
        return roomMap.get(roomName);
    }

    StageRoom create(RoomDto roomDto, UserBo creator) {
        if (roomNameExists(roomDto.getRoomId())) {
            throw new CustomException("房间名重复:" + roomDto.getRoomId());
        }

        if (!StringUtils.isEmpty(creator.getRoomId())) {
            throw new CustomException("用户正在其他房间中");
        }

        if (roomDto.getRoomType() == null) {
            throw new CustomException("房间类型不能为空");
        }

        if (roomDto.getJoinTeamType() == null) {
            throw new CustomException("队伍不能为空");
        }

        //mapService会自动抛出异常，这里不用再做空判断
        MapMangerBo mapMangerBo = new MapMangerBo(mapService, roomDto.getMapId(), roomDto.getRoomType());

        log.info("room:{} will be created", roomDto);
        StageRoom stageRoom = new StageRoom(roomDto, creator, mapMangerBo, messageService, userService);
        roomMap.put(stageRoom.getRoomId(), stageRoom);
        roomList.add(stageRoom);
        return stageRoom;
    }
}
