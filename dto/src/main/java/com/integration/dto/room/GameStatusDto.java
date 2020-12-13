package com.integration.dto.room;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/6
 */

@Data
@NoArgsConstructor
public class GameStatusDto {
    private GameStatusType type;
    private Integer score;
    private Integer rank;

    public GameStatusDto(GameStatusType type) {
        this.type = type;
    }

    public boolean isPause() {
        return type == GameStatusType.PAUSE ||
               type == GameStatusType.END ||
               type == GameStatusType.WIN ||
               type == GameStatusType.LOSE;
    }

    public void init() {
        type = GameStatusType.NORMAL;
        score = null;
        rank = null;
    }
}
