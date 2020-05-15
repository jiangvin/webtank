package com.integration.bot.advice;

import com.integration.util.model.CustomException;
import com.integration.util.model.ResultDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/1
 */

@ControllerAdvice("com.integration.bot.controller")
@Slf4j
public class ExceptionAdvice {
    @ResponseBody
    @ExceptionHandler(Exception.class)
    public ResultDto exceptionHandler(Exception e) {
        String msg;
        if (e instanceof CustomException) {
            msg = e.getMessage();
        } else {
            log.error("catch controller error:", e);
            msg = e.getClass().getName() + ":" + e.getMessage();
        }
        return new ResultDto(msg);
    }
}
