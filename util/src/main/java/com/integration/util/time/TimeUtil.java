package com.integration.util.time;

import java.sql.Timestamp;
import java.util.Calendar;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/22
 */
public class TimeUtil {
    public static Timestamp after(int days) {
        return new Timestamp(System.currentTimeMillis() + (24L * 60L * 60L * 1000L) * days);
    }

    public static Timestamp tomorrow() {
        return after(1);
    }

    public static Timestamp yesterday() {
        return after(-1);
    }

    public static Timestamp now() {
        return new Timestamp(System.currentTimeMillis());
    }

    public static Timestamp startInDay(Timestamp timestamp) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(timestamp);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        return new Timestamp(calendar.getTimeInMillis());
    }

    public static Timestamp endInDay(Timestamp timestamp) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(timestamp);
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        return new Timestamp(calendar.getTimeInMillis());
    }
}
