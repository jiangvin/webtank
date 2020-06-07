package com.integration.bot.controller;

import com.integration.dto.bot.BotDto;
import com.integration.bot.service.BotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/15
 */

@Controller("/")
public class MainController {
    @Autowired
    private BotService botService;

    @GetMapping("/")
    public ModelAndView tankGame() {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("index");
        return mav;
    }

    @PostMapping("requestBot")
    @ResponseBody
    public boolean requestBot(@RequestBody BotDto botDto) {
        botService.createBot(botDto);
        return true;
    }
}
