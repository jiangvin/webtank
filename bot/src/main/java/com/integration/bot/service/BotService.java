package com.integration.bot.service;

import com.integration.bot.model.BaseBot;
import com.integration.bot.model.SimpleBot;
import com.integration.dto.bot.BotDto;
import com.integration.util.model.CustomException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

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

    private Random random = new Random();

    private List<String> botNameList;
    private int botGenerateTimes = 0;

    public static String serverAddress;

    @PostConstruct
    private void init() {
        initBotNames();
        serverAddress = String.format("http://%s/websocket-simple?name=", serverHost);
    }

    private List<BaseBot> botList = new ArrayList<>();

    public void createBot(BotDto botDto) {
        if (StringUtils.isEmpty(botDto.getName())) {
            botDto.setName(getBotName());
        }

        log.info("receive request bot:{}", botDto.toString());
        BaseBot bot = botFactory(botDto);
        if (bot.isDead()) {
            bot.close();
            throw new CustomException("连接建立失败!");
        }

        log.info("bot will be created:{}", bot.getName());
        botList.add(bot);
    }

    private BaseBot botFactory(BotDto botDto) {
        BaseBot bot;
        switch (botDto.getBotType()) {
            default:
                bot = new SimpleBot(botDto);
                break;
        }
        return bot;
    }

    @Scheduled(fixedRate = 16)
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

    private void initBotNames() {
        botNameList = new ArrayList<>();
        botNameList.add("一波流");
        botNameList.add("YOYO");
        botNameList.add("群殴");
        botNameList.add("开局撸基地");
        botNameList.add("开局一张图");
        botNameList.add("一打七");
        botNameList.add("多人运动");
    }

    private String getBotName() {
        return String.format("%s(bot%d)", botNameList.get(random.nextInt(botNameList.size())), ++botGenerateTimes);
    }
}
