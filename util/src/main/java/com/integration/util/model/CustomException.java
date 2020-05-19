package com.integration.util.model;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/1
 */
public class CustomException extends RuntimeException {

    @Getter
    HttpStatus httpStatus = HttpStatus.OK;

    public CustomException(String msg) {
        super(msg);
    }

    public CustomException(String msg, HttpStatus httpStatus) {
        super(msg);
        this.httpStatus = httpStatus;
    }
}
