package com.integration.socket.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.integration.socket.repository.jooq.tables.records.StarRecord;
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
    private String token;

    static public StarDto convert(StarRecord record) {
        StarDto starDto = new StarDto();
        starDto.setMapId(record.getMapId());
        starDto.setSubId(record.getSubId());
        starDto.setHardMode(record.getHardMode());
        starDto.setStar(record.getStar());
        return starDto;
    }
}
