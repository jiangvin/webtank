package com.integration.socket.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/17
 */

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
public class StarDto {
    private String userId;
    private int mapId;
    private int subId;
    private boolean hardMode;
    private int star;
}
