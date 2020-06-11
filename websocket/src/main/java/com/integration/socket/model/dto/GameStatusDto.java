package com.integration.socket.model.dto;

import com.integration.socket.model.GameStatusType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/6
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameStatusDto {
    private GameStatusType type;
    private String message;
}
