package com.integration.bot.service;

import com.integration.bot.model.BaseBot;
import com.integration.bot.model.SimpleBot;
import com.integration.dto.bot.RequestBotDto;
import com.integration.util.model.CustomException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/15
 */

@Service
@Slf4j
public class BotService {

    @Value("${server.host:localhost}")
    private String serverHost;

    public static String serverAddress;

    @PostConstruct
    private void init() {
        serverAddress = String.format("http://%s/websocket-simple?name=", serverHost);
    }

    private List<BaseBot> botList = new ArrayList<>();

    public void createBot(RequestBotDto requestBotDto) {
        log.info("receive request bot:{}", requestBotDto.toString());
        BaseBot bot = botFactory(requestBotDto);
        if (bot.isDead()) {
            bot.close();
            throw new CustomException("连接建立失败!");
        }

        log.info("bot will be created:{}", bot.getName());
        botList.add(bot);
    }

    private BaseBot botFactory(RequestBotDto requestBotDto) {
        BaseBot bot;
        switch (requestBotDto.getBotType()) {
            default:
                bot = new SimpleBot(requestBotDto);
                break;
        }
        return bot;
    }

    @Scheduled(fixedRate = 17)
    public void update() {
        for (int i = 0; i < botList.size(); ++i) {
            BaseBot bot = botList.get(i);
            if (!bot.update()) {
                bot.close();
                log.info("bot will be removed:{}", bot.getName());
                botList.remove(i);
                --i;
            }
        }
    }

}
