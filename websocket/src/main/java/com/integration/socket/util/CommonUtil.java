package com.integration.socket.util;


import java.awt.Point;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/9
 */
public class CommonUtil {
    private static long id = 0;

    public static String getId() {
        return "generatedServerId=" + id++;
    }

    public static final int UNIT_SIZE = 36;

    public static Point getPointFromKey(String key) {
        String[] infos = key.split("_");
        return new Point(
                   Integer.parseInt(infos[0]) * UNIT_SIZE + UNIT_SIZE / 2,
                   Integer.parseInt(infos[1]) * UNIT_SIZE + UNIT_SIZE / 2);
    }

    public static String generateKey(int x, int y) {
        return String.format("%d_%d", x, y);
    }

    public static boolean betweenAnd(double target, int min, int max) {
        return target >= min && target <= max;
    }
}
