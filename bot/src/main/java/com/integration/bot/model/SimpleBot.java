package com.integration.bot.model;

import com.integration.dto.bot.RequestBotDto;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/15
 */

public class SimpleBot extends BaseBot {
    public SimpleBot(RequestBotDto requestBotDto) {
        super(requestBotDto);
    }

    @Override
    void updateExtension() {

    }
}
