package com.integration.socket.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.integration.socket.model.RoomType;
import com.integration.socket.model.TeamType;
import com.integration.socket.model.stage.StageRoom;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/4
 */

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@NoArgsConstructor
public class RoomDto {
    private String roomId;
    private String creator;
    private String mapId;
    private RoomType roomType;
    private TeamType joinTeamType;
    private Integer userCount;

    public static RoomDto convert(StageRoom stageRoom) {
        RoomDto roomDto = new RoomDto();
        roomDto.setRoomId(stageRoom.getRoomId());
        roomDto.setCreator(stageRoom.getCreator());
        roomDto.setMapId(stageRoom.getMapId());
        roomDto.setRoomType(stageRoom.getRoomType());
        roomDto.setUserCount(stageRoom.getUserCount());
        return roomDto;
    }
}
