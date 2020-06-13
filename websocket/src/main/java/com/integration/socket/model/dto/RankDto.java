package com.integration.socket.model.dto;

import com.integration.socket.repository.jooq.tables.records.RankBoardRecord;
import lombok.Data;
import org.springframework.beans.BeanUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/13
 */

@Data
public class RankDto {
    private int rank;
    private String username;
    private int gameType;
    private int score;

    private static RankDto convert(RankBoardRecord rankRecord) {
        RankDto rankDto = new RankDto();
        BeanUtils.copyProperties(rankRecord, rankDto);
        return rankDto;
    }

    public static List<RankDto> convert(List<RankBoardRecord> records) {
        List<RankDto> dtoList = new ArrayList<>();
        for (RankBoardRecord record : records) {
            dtoList.add(RankDto.convert(record));
        }
        return dtoList;
    }
}
