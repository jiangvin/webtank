package com.integration.socket.model.dto;

import com.integration.socket.model.GameStatusType;
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
    public GameStatusDto(GameStatusType type, String message) {
        this.type = type;
        this.message = message;
    }

    private GameStatusType type;
    private String message;
    private Integer score;
    private Integer rank;
}
