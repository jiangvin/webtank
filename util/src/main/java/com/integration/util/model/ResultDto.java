package com.integration.util.model;

import lombok.Data;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/1
 */

@Data
public class ResultDto {
    private boolean success;
    private Object data;
    private String message;

    public ResultDto(Object data) {
        this.data = data;
        this.success = true;
        this.message = "";
    }

    public ResultDto(String errorMessage) {
        this.success = false;
        this.message = errorMessage;
    }
}
