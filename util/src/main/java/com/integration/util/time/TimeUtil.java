package com.integration.util.time;

import java.sql.Timestamp;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/22
 */
public class TimeUtil {
    public static Timestamp tomorrow() {
        return new Timestamp(System.currentTimeMillis() + 24 * 60 * 60 * 1000);
    }
}
