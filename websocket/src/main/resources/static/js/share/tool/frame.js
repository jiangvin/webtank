/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/12
 */

export default class Frame {
    constructor() {
        this.framesPerSecond = 60;
        this.totalFrames = 0;
        this.lastFrames = 0;
        this.lastTime = Date.now();

        this.lastUpdateTime = Date.now();
    }

    /**
     * 计算帧数
     */
    calculate() {
        ++this.totalFrames;
        const offset = Date.now() - this.lastTime;
        if (offset >= 1000) {
            this.framesPerSecond = this.totalFrames - this.lastFrames;
            this.lastFrames = this.totalFrames;
            this.lastTime += offset;
        }
    }

    /**
     * 严格按照16ms一帧的频率更新，防止掉帧
     */
    update(callback) {
        const now = Date.now();
        const time = now - this.lastUpdateTime;
        if (time < 16) {
            return;
        }

        let updateTimes = Math.floor(time / 16);
        updateTimes = updateTimes < 60 ? updateTimes : 60;
        for (let i = 0; i < updateTimes; ++i) {
            callback();
        }
        this.lastUpdateTime = now;
        this.lastUpdateTime -= (time % 16);
    }
}