package com.integration.util.advice;

import com.integration.util.model.ResultDto;
import com.integration.util.object.ObjectUtil;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/1
 */
@ControllerAdvice("com")
public class ResponseAdvice implements ResponseBodyAdvice<Object> {

    static private final String PATH_FOR_RAW_BODY = "/raw";

    @Override
    public boolean supports(@NonNull MethodParameter returnType,
                            @NonNull Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body,
                                  @NonNull MethodParameter returnType,
                                  @NonNull MediaType selectedContentType,
                                  @NonNull Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  @NonNull ServerHttpRequest request,
                                  @NonNull ServerHttpResponse response) {
        //可以用request.getURI().getPath().startsWith来进行例外过滤
        if (request.getURI().getPath().endsWith(PATH_FOR_RAW_BODY)) {
            return body;
        }
        if (body instanceof ResultDto) {
            return body;
        }
        if (body instanceof String) {
            return ObjectUtil.writeValue(new ResultDto(body));
        }
        return new ResultDto(body);
    }
}
