package com.integration.util.advice;

import com.integration.util.model.CustomException;
import com.integration.util.model.ResultDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/1
 */

@ControllerAdvice("com")
@Slf4j
public class ExceptionAdvice {
    @ResponseBody
    @ExceptionHandler(Exception.class)
    public ResponseEntity exceptionHandler(Exception e) {
        String msg;
        HttpStatus httpStatus;
        if (e instanceof CustomException) {
            msg = e.getMessage();
            httpStatus = ((CustomException) e).getHttpStatus();
        } else {
            log.error("catch controller error:", e);
            msg = e.getMessage();
            httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        return new ResponseEntity(new ResultDto(msg), httpStatus);
    }
}
