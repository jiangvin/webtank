package com.integration.socket.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.ModelAndView;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/4/23
 */

@Slf4j
@Controller("/")
public class MainController {

    @Value("${title}")
    private String title;

    @GetMapping("/")
    public ModelAndView tankGame() {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("index");
        mav.getModel().put("name", title);
        return mav;
    }

    @GetMapping("/map")
    public ModelAndView map() {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("map");
        return mav;
    }
}
