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

        this.messages = [];
    }

    addStage(stage) {
        this.stages[this.stages.length] = stage;
    }

    addMessage(context, color) {
        const message = {};
        message.date = new Date();
        //显示时间300帧，5秒
        message.lifetime = 300;
        message.context = context;
        message.color = color;
        //塞在头部
        this.messages.unshift(message);
    }

    update() {
        this.backendFrame.calculate();
        this.currentStage().update();
    }

    draw(ctx) {
        this.frontFrame.calculate();
        this.currentStage().draw(ctx);
        this.drawMessage(ctx);
        this.drawTips(ctx);
    }

    currentStage() {
        return this.stages[this.stageIndex];
    }

    nextStage() {
        if (this.stageIndex < this.stages.length - 1) {
            ++this.stageIndex;
        }
    }

    drawMessage(ctx) {
        let height = Resource.height() - 40;
        ctx.font = '16px Helvetica';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        this.messages.forEach(function (message) {
            if (message.lifetime > 0) {
                message.lifetime -= 1;
            }
            ctx.globalAlpha = (message.lifetime / 300);
            ctx.fillStyle = message.color;
            ctx.fillText("[" + message.date.format("hh:mm:ss") + "] " + message.context, 25, height);
            height -= 18;
        });

        ctx.globalAlpha = 1;

        //消息全部过期，清除
        if (this.messages.length !== 0 && this.messages[0].lifetime <= 0) {
            this.messages = [];
        }
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

    pointDownEvent(point) {
        this.currentStage().pointDownEvent(point);
    }
}