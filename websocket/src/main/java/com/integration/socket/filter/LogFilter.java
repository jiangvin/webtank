package com.integration.socket.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Enumeration;

/**
 * @author 蒋文龙(Vin)
 * @description 记录访问日志
 * @date 2020/12/19
 */

@Slf4j
@Component
@Order(1)
public class LogFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) {

    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpServletRequest = (HttpServletRequest) request;

        String uri = httpServletRequest.getRequestURI();
        if (needLog(uri)) {
            //参数
            StringBuilder queryStr = new StringBuilder();
            Enumeration<String> parameters = request.getParameterNames();
            while (parameters.hasMoreElements()) {
                String str = parameters.nextElement();
                queryStr.append(str).append("=").append(request.getParameter(str)).append(" ");
            }

            log.info("\nuri={} {}ip={}",
                     httpServletRequest.getRequestURI(),
                     queryStr.toString(),
                     httpServletRequest.getRemoteAddr());

        }
        chain.doFilter(request, response);
    }

    private boolean needLog(String uri) {
        if (uri.startsWith("/image/")) {
            return false;
        }
        if (uri.startsWith("/css/")) {
            return false;
        }
        if (uri.startsWith("/js/")) {
            return false;
        }
        if (uri.startsWith("/font/")) {
            return false;
        }
        if (uri.startsWith("/audio/")) {
            return false;
        }
        return true;
    }

    @Override
    public void destroy() {

    }
}
