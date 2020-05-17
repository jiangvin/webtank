package com.integration.dto.map;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/1
 */

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
public class ItemDto {
    private String id;
    private String userId;
    private Double x;
    private Double y;
    private String typeId;
    private Integer orientation;
    private Integer action;
    private Double speed;
    private Integer teamId;
    private Integer bulletCount;
    private Integer reloadTime;
}
