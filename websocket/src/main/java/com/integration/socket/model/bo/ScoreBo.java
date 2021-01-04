package com.integration.socket.model.bo;

import lombok.Data;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/21
 */

@Data
public class ScoreBo {
    /**
     * 需跟客户端同步更新
     */
    static private final int SCORE_WIN = 500;
    static private final int SCORE_HARD_MODE = 100;
    static private final int SCORE_COM_BOOM = 10;
    static private final int SCORE_PLAYER_BOOM = -100;

    private int totalScore = 0;
    private int currentScore = 0;
    private int deadCount = 0;
    private long missionStartTime = 0;

    public void init() {
        currentScore = 0;
        deadCount = 0;
        missionStartTime = System.currentTimeMillis();
    }

    public void addWinScore(boolean hardMode) {
        int seconds = (int)((System.currentTimeMillis() - this.missionStartTime) / 1000);

        //困难模式加权
        int hardModeScore = hardMode ? SCORE_HARD_MODE : 0;

        int winScore = SCORE_WIN + hardModeScore - seconds;
        if (winScore > 0) {
            this.currentScore += winScore;
        }
    }

    private void addDeadCount() {
        deadCount += 1;
    }

    private void addScore(int score) {
        currentScore += score;
        if (currentScore < 0) {
            currentScore = 0;
        }
    }

    public void addScoreForComBoom() {
        addScore(SCORE_COM_BOOM);
    }

    public void addScoreForPlayerBoom() {
        addScore(SCORE_PLAYER_BOOM);
        addDeadCount();
    }

    public void addTotalScore() {
        totalScore += currentScore;
    }
}
