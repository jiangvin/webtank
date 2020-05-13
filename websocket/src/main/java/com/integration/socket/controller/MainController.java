package com.integration.socket.controller;

import com.integration.socket.model.MessageType;
import com.integration.socket.model.dto.MessageDto;
import com.integration.socket.service.GameService;
import com.integration.socket.service.MessageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
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

    @Autowired
    private GameService gameService;

    @Autowired
    private MessageService messageService;

    @GetMapping("/")
    public ModelAndView tankGame() {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("index");
        mav.getModel().put("name", title);
        return mav;
    }

    @GetMapping("/chat")
    public ModelAndView helloWorld() {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("main");
        mav.getModel().put("name", "chat");
        return mav;
    }

    /**
     * MessageMapping：指定要接收消息的地址，类似@RequestMapping
     * SendTo: 默认消息将被发送到与传入消息相同的目的地，但是目的地前面附加前缀（默认情况下为“/topic”}
     * @param messageDto
     * @return
     */
    @MessageMapping("/send")
    public void connect(MessageDto messageDto, SimpMessageHeaderAccessor accessor) {
        if (accessor.getUser() == null) {
            return;
        }

        String username = accessor.getUser().getName();
        try {
            gameService.receiveMessage(messageDto, username);
        } catch (Exception e) {
            log.error("receive stomp message error:", e);
            messageService.sendMessage(new MessageDto(e.getMessage(), MessageType.ERROR_MESSAGE, username));
        }
    }
}
