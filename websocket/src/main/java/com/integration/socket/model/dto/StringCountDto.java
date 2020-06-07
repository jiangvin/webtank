package com.integration.socket.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/29
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StringCountDto {
    private String key;
    private Integer value;

    public static StringCountDto copy(StringCountDto target) {
        StringCountDto dto = new StringCountDto();
        dto.setKey(target.getKey());
        dto.setValue(target.getValue());
        return dto;
    }

    public void addValue(int value) {
        this.value += value;
    }
}
