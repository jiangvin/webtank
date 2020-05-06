package com.integration.socket.stage;

import com.integration.socket.model.RoomType;
import com.integration.socket.model.TeamType;
import com.integration.socket.model.bo.UserBo;
import com.integration.socket.model.dto.MessageDto;
import com.integration.socket.model.dto.RoomDto;
import lombok.Getter;

import java.util.concurrent.ConcurrentHashMap;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/4
 */


public class StageRoom extends BaseStage {

    public StageRoom(RoomDto roomDto) {
        this.roomId = roomDto.getRoomId();
        this.creator = roomDto.getCreator();
        this.mapId = roomDto.getMapId();
        this.roomType = roomDto.getRoomType();
    }

    @Getter
    private String roomId;

    @Getter
    private String creator;

    @Getter
    private String mapId;

    @Getter
    private RoomType roomType;

    private ConcurrentHashMap<String, UserBo> userMap = new ConcurrentHashMap<>();

    public int getUserCount() {
        return userMap.size();
    }

    @Override
    public void processMessage(MessageDto messageDto, String sendFrom) {

    }

    @Override
    public void update() {

    }

    @Override
    public void remove(String username) {
        userMap.remove(username);
    }

    public void add(UserBo userBo, TeamType teamType) {
        userMap.put(userBo.getUsername(), userBo);
        userBo.setRoomId(this.roomId);
        userBo.setTeamType(teamType);
    }
}
