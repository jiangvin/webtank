package com.integration.bot.controller;

import com.integration.bot.service.BotService;
import com.integration.dto.bot.RequestBotDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/15
 */

@RestController("/")
public class MainController {
    @Autowired
    private BotService botService;

    @PostMapping("requestBot")
    public boolean requestBot(RequestBotDto requestBotDto) {
        botService.createBot(requestBotDto);
        return true;
    }
}
