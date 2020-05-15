package com.integration.socket.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.integration.socket.repository.jooq.tables.records.MapRecord;
import lombok.Data;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/14
 */

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
public class MapEditDto {
    private String id;
    private String pw;
    private String data;

    public static MapEditDto convert(MapRecord mapRecord) {
        MapEditDto mapEditDto = new MapEditDto();
        mapEditDto.setId(mapRecord.getId());
        mapEditDto.setData(mapRecord.getData());
        return mapEditDto;
    }
}
