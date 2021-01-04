package com.integration.util;


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

    public static final int AMMO_SIZE = 14;

    public static Point getPointFromKey(String key) {
        String[] infos = key.split("_");
        return new Point(
                   Integer.parseInt(infos[0]) * UNIT_SIZE + UNIT_SIZE / 2,
                   Integer.parseInt(infos[1]) * UNIT_SIZE + UNIT_SIZE / 2);
    }

    public static Point getGridPointFromKey(String key) {
        String[] infos = key.split("_");
        return new Point(Integer.parseInt(infos[0]), Integer.parseInt(infos[1]));
    }

    public static String generateKey(int x, int y) {
        return String.format("%d_%d", x, y);
    }

    public static String ignoreNull(String lombokToString) {
        return lombokToString != null ? lombokToString
               .replaceAll("(?<=(, |\\())[^\\s(]+?=null(?:, )?", "")
               .replaceFirst(", \\)$", ")") : null;
    }

    private static Point generateGridPoint(double x, double y) {
        return new Point((int)(x / CommonUtil.UNIT_SIZE), (int)(y / CommonUtil.UNIT_SIZE));
    }

    public static String generateGridKey(double x, double y) {
        Point point = generateGridPoint(x, y);
        return generateKey(point.x, point.y);
    }
}
