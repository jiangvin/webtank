package com.integration.dto.bot;

import com.integration.dto.room.TeamType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/15
 */

@Data
@NoArgsConstructor
public class BotDto {
    private String name;
    @NonNull private String roomId;
    @NonNull private TeamType teamType;
    private BotType botType = BotType.SIMPLE;
}
