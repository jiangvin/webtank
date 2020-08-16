package com.integration.socket.controller;

import com.integration.util.model.CustomException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/8/16
 */
@RestController
@RequestMapping("app")
public class AppController {

    static final private String PLATFORM_IOS = "IOS";
    static final private String PLATFORM_ANDROID = "ANDROID";

    static final private String VERSION = "1.0.0";

    @GetMapping("/versionCheck")
    public boolean versionCheck(@RequestParam("platform") String platform,
                                @RequestParam("version") String version) {
        platform = platform.toUpperCase();
        if (!PLATFORM_IOS.equals(platform) && !PLATFORM_ANDROID.equals(platform)) {
            throw new CustomException("不支持的平台!");
        }

        if (!VERSION.equals(version)) {
            throw new CustomException("请下载最新版本进入游戏!");
        }
        return true;
    }
}
