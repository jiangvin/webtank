package com.integration.util.object;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.Map;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/2
 */

@Slf4j
public class ObjectUtil {
    private static ObjectMapper objectMapper = new ObjectMapper();
    static {
        //忽略未知字段
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    public static String writeValue(Object object) {
        if (object == null) {
            return null;
        }
        try {
            if (object instanceof String) {
                return (String) object;
            }
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            log.error("write class:{} to json error:{}", object.getClass().getName(), e.getMessage());
            return null;
        }
    }

    public static <T> T readValue(String json, Class<T> valueType) {
        try {
            return objectMapper.readValue(json, valueType);
        } catch (IOException e) {
            log.error(String.format("parse json:%s to class:%s error:%s", json, valueType.getName(), e.getMessage()));
            return null;
        }
    }

    public static <T> T readValue(Map map, Class<T> valueType) {
        try {
            return objectMapper.readValue(objectMapper.writeValueAsString(map), valueType);
        } catch (IOException e) {
            log.error(String.format("parse map:%s to class:%s error:%s", map.toString(), valueType.getName(), e.getMessage()));
            return null;
        }
    }

    public static <T> T convertValue(Object object, Class<T> valueType) {
        return objectMapper.convertValue(object, valueType);
    }

    public static <T> T readValue(Object object, Class<T> valueType) {
        if (object == null) {
            return null;
        }

        if (object instanceof Map) {
            return readValue((Map)object, valueType);
        } else if (object instanceof String) {
            return readValue((String) object, valueType);
        } else {
            return readValue(object.toString(), valueType);
        }
    }
}
