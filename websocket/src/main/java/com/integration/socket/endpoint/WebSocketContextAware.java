package com.integration.socket.endpoint;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.annotation.Lazy;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/29
 */
@Component
@Lazy(false)
public class WebSocketContextAware implements ApplicationContextAware {

    private static ApplicationContext APPLICATION_CONTEXT;

    @Override
    public void setApplicationContext(@NonNull ApplicationContext applicationContext) throws BeansException {
        APPLICATION_CONTEXT = applicationContext;
    }

    static ApplicationContext getApplicationContext() {
        return APPLICATION_CONTEXT;
    }
}
