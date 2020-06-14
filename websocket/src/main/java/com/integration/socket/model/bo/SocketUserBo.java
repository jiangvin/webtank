package com.integration.socket.model.bo;

import lombok.Getter;

import javax.websocket.Session;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/29
 */

public class SocketUserBo extends UserBo {

    private static final String USER_ID_PREFIX = "name=";

    @Getter
    private Session session;

    private SocketUserBo(Session session, String userId) {
        super(userId, session.getId());
        this.session = session;
    }

    public static String getUserIdFromSession(Session session) throws UnsupportedEncodingException {
        if (!session.getQueryString().startsWith(USER_ID_PREFIX)) {
            return null;
        }

        return URLDecoder.decode(session.getQueryString().substring(USER_ID_PREFIX.length()), "utf-8");
    }

    public static SocketUserBo convertSocketUserBo(Session session) throws UnsupportedEncodingException {
        String userId = getUserIdFromSession(session);
        if (userId == null) {
            return null;
        }
        return new SocketUserBo(session, userId);
    }
}
