package com.integration.dto.bot;

import com.integration.dto.room.TeamType;
import lombok.Data;
import lombok.NonNull;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/15
 */

@Data
public class RequestBotDto {
    @NonNull private String name;
    @NonNull private String roomId;
    @NonNull private TeamType teamType;
    private BotType botType = BotType.SIMPLE;
}
