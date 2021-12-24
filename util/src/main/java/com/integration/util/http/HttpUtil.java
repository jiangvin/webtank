package com.integration.util.http;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.integration.util.model.CustomException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.Map;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/29
 */

@Slf4j
public class HttpUtil {
    private static final String KEY_OF_PARAM = "?";
    private static final HttpUtil httpUtils = new HttpUtil();

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpHeaders formHeaders;
    private final HttpHeaders jsonHeaders;

    private HttpUtil() {
        formHeaders = new HttpHeaders();
        formHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        jsonHeaders = new HttpHeaders();
        jsonHeaders.setContentType(MediaType.APPLICATION_JSON);
    }

    public static <T> T getRequest(String url, Class<T> type) {
        return getRequest(url, type, null);
    }

    public static <T> T getRequest(String url, Class<T> type, Map<String, String> params) {
        try {
            url = generateUrlWithParams(url, params);
            log.info("Send get request to url:{}", url);
            ResponseEntity<String> responseStr = httpUtils.restTemplate.getForEntity(url, String.class);
            String receiveStr = responseStr.getBody();
            if (receiveStr != null && receiveStr.length() > 128) {
                receiveStr = receiveStr.substring(0, 128).replace("\n", " ") + "...";
            }
            log.info("Receive response:{}, try to convert to {}", receiveStr, type.getName());
            if (type == String.class) {
                return type.cast(responseStr.getBody());
            } else {
                return httpUtils.objectMapper.readValue(responseStr.getBody(), type);
            }
        } catch (HttpClientErrorException e) {
            throw new CustomException(e.getStatusCode().toString());
        } catch (Exception e) {
            log.error("Catch http error:", e);
            throw new CustomException(e.getMessage());
        }
    }

    public static <T> T postJsonRequest(String url, Class<T> type, Object object) {
        try {
            HttpEntity<String> request = new HttpEntity<>(httpUtils.objectMapper.writeValueAsString(object), httpUtils.jsonHeaders);
            return sendPost(url, type, request);
        } catch (HttpClientErrorException e) {
            throw new CustomException(e.getStatusCode().toString());
        } catch (Exception e) {
            log.error("Catch http error:", e);
            throw new CustomException(e.getMessage());
        }
    }

    public static <T> T postFormRequest(String url, Class<T> type, Map<String, String> params) {
        try {
            HttpEntity<MultiValueMap<String, String>> request = generateRequest(params);
            return sendPost(url, type, request);
        } catch (HttpClientErrorException e) {
            throw new CustomException(e.getStatusCode().toString());
        } catch (Exception e) {
            log.error("Catch http error:", e);
            throw new CustomException(e.getMessage());
        }
    }

    private static <T> T sendPost(String url, Class<T> type, HttpEntity request) throws IOException {
        log.info("Send post request:{} to url:{}", request.toString(), url);
        ResponseEntity<String> responseStr = httpUtils.restTemplate.postForEntity(url, request, String.class);
        log.info("Receive response:{}, try to convert to {}", responseStr.getBody(), type.getName());
        if (type == String.class) {
            return type.cast(responseStr.getBody());
        } else {
            return httpUtils.objectMapper.readValue(responseStr.getBody(), type);
        }
    }

    private static String generateUrlWithParams(String url, Map<String, String> params) {
        if (params == null || params.isEmpty()) {
            return url;
        }

        for (Map.Entry<String, String> param : params.entrySet()) {
            url += String.format("%s%s=%s", getUrlMatching(url), param.getKey(), param.getValue());
        }

        return url;
    }

    private static HttpEntity<MultiValueMap<String, String>> generateRequest(Map<String, String> params) {
        MultiValueMap<String, String> pushMap = new LinkedMultiValueMap<>(16);
        params.forEach(pushMap::add);
        return new HttpEntity<>(pushMap, httpUtils.formHeaders);
    }

    private static String getUrlMatching(String url) {
        if (url.contains(KEY_OF_PARAM)) {
            return "&";
        }

        return KEY_OF_PARAM;
    }
}
