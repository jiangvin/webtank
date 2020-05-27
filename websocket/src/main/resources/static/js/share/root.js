/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/25
 */

import './libs/stomp.js'
import './libs/sockjs.js'

import Frame from './tool/frame.js'
import Resource from './tool/resource.js'
import Status from "./tool/status.js"
import Common from "./tool/common.js"

export default class Root {
    constructor() {
        this.frontFrame = new Frame();
        this.backendFrame = new Frame();

        this.stages = [];
        this.stageIndex = 0;

        this.messages = [];

        this.timeEvents = [];
    }

    addTimeEvent(eventType, callBack, timeout, ignoreLog) {
        const event = {};
        event.eventType = eventType;
        event.callback = callBack;
        event.timeout = timeout ? timeout : 100; //默认100帧倒计时，不到1.5秒
        event.ignoreLog = ignoreLog;
        this.timeEvents.push(event);
    };

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
        this.updateEvents();
        this.currentStage().update();
    }

    updateEvents() {
        for (let i = 0; i < this.timeEvents.length; ++i) {
            const event = this.timeEvents[i];
            if (event.timeout > 0) {
                --event.timeout;
            } else {
                if (event.ignoreLog !== true) {
                    console.log("process time event:" + event.eventType);
                }
                event.callback();
                //删除事件
                this.timeEvents.splice(i, 1);
                --i;
            }
        }
    }

    draw(ctx) {
        this.frontFrame.calculate();
        this.currentStage().draw(ctx);
        this.drawMessage(ctx);
        this.drawTips(ctx);
        this.drawStatus(ctx);
    }

    currentStage() {
        return this.stages[this.stageIndex];
    }

    nextStage() {
        if (this.stageIndex < this.stages.length - 1) {
            ++this.stageIndex;
        }
    }

    drawStatus(ctx) {
        if (Status.getShowMask()) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, Resource.width(), Resource.height());
            ctx.globalAlpha = 1;
        }

        if (Status.getMessage()) {
            Common.drawTitle(Status.getMessage());
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