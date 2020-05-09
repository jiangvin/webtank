package com.integration.socket.util;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/9
 */
public class CommonUtil {
    private static int id = 0;

    public static String getId() {
        return "generatedServerId=" + id++;
    }
}
