package com.integration.socket.model.bo;

import lombok.Getter;

import javax.websocket.Session;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/29
 */

public class WxUserBo extends UserBo {

    private static final String USER_ID_PREFIX = "name=";

    @Getter
    private Session session;

    private WxUserBo(Session session, String userId) {
        super(userId, session.getId());
        this.session = session;
    }

    public static String getUserIdFromSession(Session session) {
        if (!session.getQueryString().startsWith(USER_ID_PREFIX)) {
            return null;
        }

        return session.getQueryString().substring(USER_ID_PREFIX.length());
    }

    public static WxUserBo convertWxUserBo(Session session) {
        String userId = getUserIdFromSession(session);
        if (userId == null) {
            return null;
        }
        return new WxUserBo(session, userId);
    }
}
