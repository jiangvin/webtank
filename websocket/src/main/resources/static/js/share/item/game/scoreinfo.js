/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/21
 */

export default class ScoreInfo {
    constructor() {
        this.totalScore = 0;
        this.currentScore = 0;
        this.deadCount = 0;
        this.missionStartTime = 0;
    }

    init() {
        this.currentScore = 0;
        this.deadCount = 0;
        this.missionStartTime = Date.now();
    }

    addScoreForComBoom() {
        this.addScore(ScoreInfo.scoreComBoom);
    }

    addScoreForPlayerBoom() {
        this.addScore(ScoreInfo.scorePlayerBoom);
        ++this.deadCount;
    }

    addScore(score) {
        this.currentScore += score;
        if (this.currentScore < 0) {
            this.currentScore = 0;
        }
    }

    addTotalScore() {
        this.totalScore += this.currentScore;
    }

    addWinScore(hardMode) {
        const gameSeconds = (new Date() - this.missionStartTime) / 1000;
        //困难模式加权
        const hardModeScore = hardMode ? ScoreInfo.scoreHardMode : 0;

        let winScore = Math.floor(ScoreInfo.scoreWin + hardModeScore - gameSeconds);
        if (winScore < 0) {
            winScore = 0;
        }
        this.addScore(winScore);
    }
}
/**
 * 需要和服务器同步
 */
ScoreInfo.scoreComBoom = 10;
ScoreInfo.scorePlayerBoom = -100;
ScoreInfo.scoreHardMode = 100;
ScoreInfo.scoreWin = 500;