package com.integration.socket.model.dto;

import com.integration.dto.room.RoomDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/5
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomListDto {
    private List<RoomDto> roomList;
    private int roomCount;
}
