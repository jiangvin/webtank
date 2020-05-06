package com.integration.util.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/4/26
 */
public class ExceptionUtil {
    public enum Type {
        INVALID_CLIENT("Invalid client information!"),
        INVALID_USER("Invalid user information!"),
        INVALID_TOKEN("Invalid token!"),
        INVALID_USER_NAME("Invalid user name!"),
        INVALID_PASSWORD("Invalid password!"),
        INVALID_USER_TOKEN("Invalid user token!"),
        INVALID_REFRESH_TOKEN("Invalid refresh token!"),
        INVALID_GRANT_TYPE("Invalid grant type!"),
        INVALID_SCOPE("Invalid scope!"),

        USER_NAME_ALREADY_EXISTS("Username already exists!"),

        EXPIRED_TOKEN("token has expired!"),
        EXPIRED_REFRESH_TOKEN("refresh token has expired!"),

        PERMISSION_DENIED("permission denied!"),
        GRANT_TYPE_PERMISSION("Client has no permission of this grant type!");

        private final String msg;

        Type(String msg) {
            this.msg = msg;
        }

        @Override
        public String toString() {
            return msg;
        }
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public static class BadRequestException extends RuntimeException {
        public BadRequestException(Type type) {
            super(type.toString());
        }
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    public static class ForbiddenException extends RuntimeException {
        public ForbiddenException(Type type) {
            super(type.toString());
        }
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public static class UnauthorizedException extends RuntimeException {
        public UnauthorizedException(Type type) {
            super(type.toString());
        }
    }
}
