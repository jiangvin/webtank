/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/25
 */

import Frame from './tool/frame.js'
import Resource from './tool/resource.js'

export default class Root {
    constructor() {
        this.frontFrame = new Frame();
        this.backendFrame = new Frame();
        this.stages = [];
        this.stageIndex = 0;
    }

    addStage(stage) {
        this.stages[this.stages.length] = stage;
    }

    update() {
        this.backendFrame.calculate();
        this.currentStage().update();
    }

    draw(ctx) {
        this.frontFrame.calculate();
        this.currentStage().draw(ctx);
        this.drawTips(ctx);
    }

    currentStage() {
        return this.stages[this.stageIndex];
    }

    drawTips(ctx) {
        //版权信息
        ctx.font = '14px Helvetica';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('© Created by Vin (WX: Jiang_Vin)', Resource.width() - 12, Resource.height() - 5);

        //帧率信息
        ctx.textAlign = 'left';
        let text = '帧率:' + this.frontFrame.frames + '-' + this.backendFrame.frames;
        ctx.fillText(text, 10, Resource.height() - 5);
    }
}