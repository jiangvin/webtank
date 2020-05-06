package com.integration.socket.stage;

import com.integration.socket.model.RoomType;
import com.integration.socket.model.dto.MessageDto;
import lombok.Getter;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/4
 */


public class StageRoom extends BaseStage {

    @Getter
    private String roomId;

    @Getter
    private String creator;

    @Getter
    private String mapId;

    @Getter
    private RoomType roomType;

    @Getter
    private int userCount;

    @Override
    public void processMessage(MessageDto messageDto, String sendFrom) {

    }

    @Override
    public void update() {

    }

    @Override
    public void remove(String username) {

    }
}
