package com.integration.dto.room;

import com.fasterxml.jackson.annotation.JsonInclude;
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
    private int mapId;
    private int subId;
    private RoomType roomType;
    private TeamType joinTeamType;
    private Integer userCount;

    /**
     * 困难模式下电脑可以吃道具
     */
    private boolean hardMode = false;
}
