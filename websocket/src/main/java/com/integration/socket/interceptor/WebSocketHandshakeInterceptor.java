package com.integration.socket.interceptor;

import com.integration.socket.service.OnlineUserService;
import com.integration.util.exception.ExceptionUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/4/26
 */

@Component
@Slf4j
public class WebSocketHandshakeInterceptor extends HttpSessionHandshakeInterceptor {

    private final OnlineUserService onlineUserService;

    public WebSocketHandshakeInterceptor(OnlineUserService onlineUserService) {
        this.onlineUserService = onlineUserService;
    }


    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler webSocketHandler,
                                   @NonNull Map<String, Object> attributes) throws Exception {
        HttpServletRequest servletRequest = ((ServletServerHttpRequest) request).getServletRequest();

        final String name = servletRequest.getParameter("name");
        if (StringUtils.isEmpty(name)) {
            throw new ExceptionUtil.BadRequestException(ExceptionUtil.Type.INVALID_USER_NAME);
        }

        if (onlineUserService.exists(name)) {
            throw new ExceptionUtil.ForbiddenException(ExceptionUtil.Type.USER_NAME_ALREADY_EXISTS);
        }
        return super.beforeHandshake(request, response, webSocketHandler, attributes);
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception e) {
        super.afterHandshake(request, response, wsHandler, e);
    }
}
