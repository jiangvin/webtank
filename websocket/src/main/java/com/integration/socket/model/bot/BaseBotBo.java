package com.integration.socket.model.bot;

import com.integration.dto.bot.BotType;
import com.integration.dto.room.GameStatusType;
import com.integration.dto.room.TeamType;
import com.integration.socket.model.bo.UserBo;
import com.integration.socket.model.stage.StageRoom;
import com.integration.util.CommonUtil;
import lombok.Data;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/8
 */

@Data
public abstract class BaseBotBo {
    private BotType botType;
    private StageRoom stage;
    private UserBo botUser;

    BaseBotBo() {
        botUser = new UserBo(CommonUtil.getId());
    }

    public void setTeamType(TeamType teamType) {
        botUser.setTeamType(teamType);
    }

    public TeamType getTeamType() {
        return botUser.getTeamType();
    }

    public String getId() {
        return botUser.getUsername();
    }

    public static BaseBotBo getInstance(BotType botType) {
        switch (botType) {
            case SIMPLE:
                return new SimpleBotBo();
            default:
                return new SimpleBotBo();
        }
    }

    public void update() {
        if (isPause()) {
            return;
        }
        updateExtension();
    }

    /**
     * 具体更新逻辑
     */
    abstract void updateExtension();

    private boolean isPause() {
        return stage.getGameStatus().isPause() ||
               (stage.getGameStatus().getType() == GameStatusType.PAUSE_RED &&
                botUser.getTeamType() == TeamType.RED) ||
               (stage.getGameStatus().getType() == GameStatusType.PAUSE_BLUE &&
                botUser.getTeamType() == TeamType.BLUE);
    }
}
