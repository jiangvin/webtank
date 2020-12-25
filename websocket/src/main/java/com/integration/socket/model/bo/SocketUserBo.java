package com.integration.socket.model.bo;

import com.integration.dto.message.MessageDto;
import com.integration.util.object.ObjectUtil;
import lombok.extern.slf4j.Slf4j;

import javax.websocket.Session;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/29
 */

@Slf4j
public class SocketUserBo extends UserBo {

    private static final String USER_NAME_PREFIX = "name=";
    private static final String USER_ID_PREFIX = "id=";

    private final Session session;

    private SocketUserBo(Session session, String username, String userId) {
        super(username);
        this.session = session;
        this.setUserId(userId);
    }

    @Override
    public void sendMessage(MessageDto messageDto) {
        try {
            synchronized (session) {
                session.getBasicRemote().sendText(ObjectUtil.writeValue(messageDto));
            }
        } catch (IOException e) {
            log.error("catch send user:{} message error:", getUsername(), e);
        }
    }

    @Override
    public void disconnect() {
        try {
            session.close();
        } catch (IOException e) {
            log.error("catch send user:{} close error:", getUsername(), e);
        }
    }

    private static String getQueryParam(String name, String[] queryInfos) throws UnsupportedEncodingException {
        for (String queryInfo : queryInfos) {
            if (queryInfo.startsWith(name)) {
                return URLDecoder.decode(queryInfo.substring(name.length()), "utf-8");
            }
        }
        return null;
    }

    public static SocketUserBo convertSocketUserBo(Session session) throws UnsupportedEncodingException {
        String[] queryInfos = session.getQueryString().split("&");
        String username = getQueryParam(USER_NAME_PREFIX, queryInfos);
        if (username == null) {
            return null;
        }
        String userId = getQueryParam(USER_ID_PREFIX, queryInfos);
        return new SocketUserBo(session, username, userId);
    }

    public static String getUsernameFromSession(Session session) throws UnsupportedEncodingException {
        String[] queryInfos = session.getQueryString().split("&");
        return getQueryParam(USER_NAME_PREFIX, queryInfos);
    }
}
