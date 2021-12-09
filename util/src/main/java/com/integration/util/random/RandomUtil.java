package com.integration.util.random;

import java.util.Random;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2021/12/9
 */
public class RandomUtil {
    private static final Random RANDOM = new Random();

    public static int randomRange(int min, int max) {
        int offset = max - min + 1;
        return RANDOM.nextInt(offset) + min;
    }
}
