/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/25
 */

import Frame from './tool/frame.js'
import Resource from './tool/resource.js'
import Common from "./tool/common.js"
import NetEngine from "./engine/netEngine.js";
import AiEngine from "./engine/aiEngine.js";
import Menu from "./stage/menu.js";
import Rank from "./stage/rank.js";
import Room from "./stage/room.js";
import Mission from "./stage/mission.js";
import NetList from "./stage/netlist.js";
import NetCreate from "./stage/netcreate.js";
import Shop from "./stage/shop.js";
import Context from "./tool/context.js";

export default class Root {
    constructor(ctx) {
        Context.contextExtension(ctx);
        this.ctx = ctx;

        this.frame = new Frame();

        this.stages = [];
        this.stageIndex = 0;
        this.preStageIndex = -1;

        this.messages = [];

        this.timeEvents = [];
        this.messageEvents = new Map();

        this.engine = null;

        /**
         * 房间的用户
         */
        this.users = null;

        /**
         * 网络延迟测试
         */
        this.netDelay = 0;
    }

    addTimeEvent(eventType, callback, timeout) {
        const event = {};
        event.eventType = eventType;
        event.callback = callback;
        event.timeout = timeout ? timeout : 100;
        this.timeEvents.push(event);
    };

    addMessageEvent(eventType, callback) {
        //消息已存在
        if (this.messageEvents.has(eventType)) {
            return;
        }

        const messageEvent = {};
        messageEvent.callback = callback;
        this.messageEvents.set(eventType, messageEvent);
    }

    addGameStage() {
        this.addStage(new Menu());
        this.addStage(new Rank());
        this.addStage(new Mission());
        this.addStage(new Room());
        this.addStage(new NetList());
        this.addStage(new NetCreate());
        this.addStage(new Shop());
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

    /**
     * 初始化引擎
     * @param isNetEngine
     */
    addEngine(isNetEngine) {
        if (isNetEngine) {
            this.engine = new NetEngine(this.currentStage());
        } else {
            this.engine = new AiEngine(this.currentStage());
        }
    }

    update() {
        this.frame.update(() => {
            this.updateMessage();
            this.updateTimeEvents();
            this.updateEngine();
            this.currentStage().update();
        });
    }

    updateEngine() {
        if (!this.engine) {
            return;
        }
        this.engine.update();
    }

    updateMessageEvents(messageType) {
        if (!this.messageEvents.has(messageType)) {
            return;
        }
        const event = this.messageEvents.get(messageType);
        this.messageEvents.delete(messageType);
        event.callback();
    }

    updateTimeEvents() {
        for (let i = 0; i < this.timeEvents.length; ++i) {
            const event = this.timeEvents[i];
            if (event.timeout > 0) {
                --event.timeout;
            } else {
                console.log("process time event:" + event.eventType);
                event.callback();
                //删除事件
                this.timeEvents.splice(i--, 1);
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, Resource.width(), Resource.height());
        this.frame.calculate();
        this.currentStage().draw(this.ctx);
        this.drawMessage();
        this.drawTips();
    }

    currentStage() {
        return this.stages[this.stageIndex];
    }

    prepareSwitchStage(options) {
        if (this.preStageIndex !== -1) {
            this.stages[this.preStageIndex].destroy();
        }
        this.currentStage().init(options);
    }

    nextStage(options) {
        if (this.stageIndex < this.stages.length - 1) {
            this.preStageIndex = this.stageIndex++;
            this.prepareSwitchStage(options);
        }
    }

    lastStage(options) {
        if (this.stageIndex > 0) {
            this.preStageIndex = this.stageIndex--;
            this.prepareSwitchStage(options);
        }
    }

    preStage(options) {
        if (this.preStageIndex < 0 || this.preStageIndex === this.stageIndex) {
            return;
        }
        this.stageIndex = this.preStageIndex;
        this.preStageIndex = -1;
        this.prepareSwitchStage(options);
    }

    gotoStage(id, options) {
        if (this.currentStage().getId() === id) {
            return;
        }

        for (let i = 0; i < this.stages.length; ++i) {
            if (this.stages[i].getId() === id) {
                this.preStageIndex = this.stageIndex;
                this.stageIndex = i;
                this.prepareSwitchStage(options);
                return;
            }
        }
    }

    drawMessage() {
        let height = 160;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'bottom';
        this.messages.forEach(message => {
            this.ctx.globalAlpha = (message.lifetime / 300);
            this.ctx.fillStyle = message.color;
            this.ctx.displayText("[" + message.date.format("hh:mm:ss") + "] " + message.context,
                160, height, 30);
            height += 35;
        });
        this.ctx.globalAlpha = 1;
    }

    updateMessage() {
        this.messages.forEach(function (message) {
            if (message.lifetime > 0) {
                message.lifetime -= 1;
            }
        });
        //消息全部过期，清除
        if (this.messages.length !== 0 && this.messages[0].lifetime <= 0) {
            this.messages = [];
        }
    }

    drawTips() {
        if (!Resource.isDebug()) {
            return;
        }

        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillStyle = '#ffffff';

        //帧率信息
        let text = "分辨率:" + Resource.width() + "x" + Resource.height();
        text += ' 帧率:' + this.frame.framesPerSecond;
        if (this.netDelay) {
            text += ' / 延迟:' + this.netDelay + 'ms';
        }
        if (this.users) {
            text += ' / 房间人数:' + this.users.length;
        }
        this.ctx.displayText(text, 10, -5, 35, null, false);
    }

    processPointDownEvent(point) {
        this.currentStage().processPointDownEvent(point);
    }

    /**
     * 网络连接相关
     * @param messageDto
     */
    processSocketMessage(messageDto) {
        //处理消息事件
        this.updateMessageEvents(messageDto.messageType);

        switch (messageDto.messageType) {
            case "USER_MESSAGE":
                Common.addMessage(messageDto.message, "#FFF");
                break;
            case "SYSTEM_MESSAGE":
                Common.addMessage(messageDto.message, "#FF0");
                break;
            case "ERROR_MESSAGE":
                Common.addMessage(messageDto.message, "#F00");
                break;
            case "USERS":
                this.users = messageDto.message;
                break;
            default:
                break;
        }
        //给当前场景处理服务消息
        this.currentStage().processSocketMessage(messageDto);
    };

    processControlEvent(control) {
        if (this.engine) {
            this.engine.processControlEvent(control);
        }
    }
}