package com.integration.util.message;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/2/28
 */
@Component
@Slf4j
public class MessageUtil {

    /**
     * MessageSource must be ResourceBundleMessageSource
     */
    private static MessageSource ms;

    public MessageUtil(MessageSource messageSource) {
        ms = messageSource;
    }

    /**
     * 获取单个国际化翻译值
     */
    public static String get(String msgKey, Object... objects) {
        try {
            return ms.getMessage(msgKey, objects, LocaleContextHolder.getLocale());
        } catch (Exception e) {
            log.error("Translation error:", e);
            return msgKey;
        }
    }
}
