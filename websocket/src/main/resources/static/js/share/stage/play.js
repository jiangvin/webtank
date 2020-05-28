export default class Play {
    constructor(frames, timePerFrame, updateEvent, endEvent) {
        //动画帧数
        this.frames = frames;

        //每帧所持续的时间
        this.timePerFrame = timePerFrame;

        //更新动作
        this.updateEvent = updateEvent;

        //结束动作
        this.endEvent = endEvent;

        //播放时间
        this.times = timePerFrame;
    }

    /**
     * 动画的更新函数
     */
    update() {
        if (this.frames < 0 || !this.updateEvent) {
            return;
        }

        //结束
        if (this.frames === 0) {
            this.frames = -1;
            if (this.endEvent) {
                this.endEvent();
            }
            return;
        }

        if (this.times === this.timePerFrame) {
            this.updateEvent();
        }

        --this.times;
        if (this.times <= 0) {
            --this.frames;
            this.times = this.timePerFrame;
        }
    };

    isFinish() {
        return this.frames < 0;
    }
}