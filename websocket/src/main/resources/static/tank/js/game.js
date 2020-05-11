'use strict';

/*
* 小型游戏引擎
*/

function Game() {
    const thisGame = this;

    //控制
    const _control = {lastOrientation: -1, lastAction: -1};

    //Game的画布初始化，要放在前面
    const _canvas = Common.getCanvas();
    const _context = Common.getContext();

    //帧率相关
    let _framesPerSecond = 60;

    //延迟相关
    let _netDelay = 0;

    //定时触发器类
    const _timeEvents = [];
    //消息触发器类
    const _messageEvents = [];

    //用户类
    let _users = [];

    //左下角消息类
    let _messages = [];

    //布景相关
    const _stages = [];
    let _index = 0;

    //渲染控制
    let _drawHandler;
    //运算控制
    let _updateHandler;

    //网络连接
    this.receiveStompMessage = function (messageDto) {
        //处理消息事件
        if (_messageEvents[messageDto.messageType]) {
            console.log("process message event:" + messageDto.messageType);
            _messageEvents[messageDto.messageType].callback();
            delete _messageEvents[messageDto.messageType];
        }

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
            case "SERVER_READY":
                serverReady();
                break;
            case "USERS":
                _users = messageDto.message;
                break;
            default:
                //给当前场景处理服务消息
                this.currentStage().receiveStompMessage(messageDto);
                break;
        }
    };

    //控制相关
    this.controlEvent = function (event) {
        switch (event) {
            case "Up":
                thisGame.controlUpdateToServer(0, 1);
                break;
            case "Down":
                thisGame.controlUpdateToServer(1, 1);
                break;
            case "Left":
                thisGame.controlUpdateToServer(2, 1);
                break;
            case "Right":
                thisGame.controlUpdateToServer(3, 1);
                break;
            case "Stop":
                thisGame.controlUpdateToServer(null, 0);
                break;
            case "FIRE":
                Common.sendStompMessage(null, "UPDATE_TANK_FIRE");
                break;
            default:
                break;
        }
        this.currentStage().controlEvent(event);
    };
    this.controlUpdateToServer = function (orientation, action) {
        let update;
        if (orientation !== null && _control.lastOrientation !== orientation) {
            update = true;
        }

        if (action != null && _control.lastAction !== action) {
            update = true;
        }

        if (!update) {
            return;
        }

        _control.lastOrientation = orientation != null ? orientation : _control.lastOrientation;
        _control.lastAction = action != null ? action : _control.lastAction;
        Common.sendStompMessage({
            orientation: _control.lastOrientation,
            action: _control.lastAction
        }, "UPDATE_TANK_CONTROL");
    };

    //动画相关
    this.start = function () {
        let totalFrames = 0;
        let lastFrames = 0;
        let lastDate = Date.now();

        //开启运算
        _updateHandler = setInterval(function () {
            switch (Status.getStatusValue()) {
                case Status.getStatusClose():
                    //游戏结束
                    thisGame.stop();
                    break;
                case Status.getStatusNormal():
                    //游戏正常运行
                    const stage = thisGame.currentStage();
                    stage.update();
                    thisGame.updateEvents();
                    break;
                default:
                    //游戏暂停，不影响游戏类的消息运行
                    thisGame.updateEvents();
                    break;
            }
        }, 17);

        //开启渲染
        const step = function () {

            //计算帧数
            ++totalFrames;
            const offset = Date.now() - lastDate;
            if (offset >= 1000) {
                _framesPerSecond = totalFrames - lastFrames;
                lastFrames = totalFrames;
                lastDate += offset;
            }

            //开始绘制画面
            _context.clearRect(0, 0, _canvas.width, _canvas.height);
            _context.fillStyle = '#2b2b2b';
            _context.fillRect(0, 0, _canvas.width, _canvas.height);

            const stage = thisGame.currentStage();
            stage.draw(_context);

            //聊天信息
            thisGame.drawMessage(_context);

            //触控板信息 - 触控模式
            thisGame.drawTouchCycle(_context);

            //常规显示信息
            thisGame.drawInfo(_context);

            _drawHandler = requestAnimationFrame(step);
        };
        _drawHandler = requestAnimationFrame(step);
    };
    this.stop = function () {
        _drawHandler && cancelAnimationFrame(_drawHandler);
        _updateHandler && clearInterval(_updateHandler);
    };

    //布景相关
    this.createStage = function (options) {
        const stage = new Stage(options);
        _stages.push(stage);
        return stage;
    };
    this.currentStage = function () {
        return _stages[_index];
    };

    //消息类
    this.addMessage = function (context, color) {
        let message = {};
        message.date = new Date();
        message.lifetime = 300; //显示时间300帧，5秒
        message.context = context;
        message.color = color;
        _messages.unshift(message); //塞在头部
    };
    this.drawMessage = function (context) {
        let height = Common.height() - 40;
        context.font = '16px Helvetica';
        context.textAlign = 'left';
        context.textBaseline = 'bottom';
        _messages.forEach(function (message) {
            if (message.lifetime > 0) {
                message.lifetime -= 1;
            }
            context.globalAlpha = (message.lifetime / 300);
            context.fillStyle = message.color;
            context.fillText("[" + message.date.format("hh:mm:ss") + "] " + message.context, 25, height);
            height -= 18;
        });

        context.globalAlpha = 1;

        //消息全部过期，清除
        if (_messages.length !== 0 && _messages[0].lifetime <= 0) {
            _messages = [];
        }
    };

    //事件类
    this.addTimeEvent = function (eventType, callBack, timeout, ignoreLog) {
        let event = {};
        event.eventType = eventType;
        event.callback = callBack;
        event.timeout = timeout ? timeout : 100; //默认100帧倒计时，不到1.5秒
        event.ignoreLog = ignoreLog;
        _timeEvents.push(event);
    };
    this.addMessageEvent = function (eventType, callBack) {
        //消息已存在
        const messageEvent = {};
        if (_messageEvents[eventType]) {
            return;
        }
        messageEvent.callback = callBack;
        _messageEvents[eventType] = messageEvent;
    };

    /**
     * 每两秒确认一次连接是否失效
     */
    this.addConnectCheckEvent = function () {
        const callBack = function () {
            if (Common.getStompStatus() === true) {
                const start = new Date().getTime();
                Common.getRequest("/user/ping", function () {
                    _netDelay = new Date().getTime() - start;
                });
                thisGame.addTimeEvent("CONNECT_CHECK", callBack, 120, true);
            } else {
                Status.setStatus(Status.getStatusPause(), "与服务器断开！");

                //TODO 断线重连
                //5秒后关闭游戏
                thisGame.addTimeEvent("CLOSE", function () {
                    Status.setStatus(Status.getStatusClose());
                }, 60 * 5);
            }
        };

        console.log("connect status will be checked per 120 frames...");
        thisGame.addTimeEvent("CONNECT_CHECK", callBack, 120);
    };
    this.updateEvents = function () {
        for (let i = 0; i < _timeEvents.length; ++i) {
            const event = _timeEvents[i];
            if (event.timeout > 0) {
                --event.timeout;
            } else {
                if (event.ignoreLog !== true) {
                    console.log("process time event:" + event.eventType);
                }
                event.callback();
                //删除事件
                _timeEvents.splice(i, 1);
                --i;
            }
        }
    };

    //显示版权信息和帧率信息
    this.drawInfo = function (context) {
        //版权信息
        context.font = '14px Helvetica';
        context.textAlign = 'right';
        context.textBaseline = 'bottom';
        context.fillStyle = '#ffffff';
        context.fillText('© Created by Vin (WX: Jiang_Vin)', Common.width() - 12, Common.height() - 5);

        //帧率信息
        context.textAlign = 'left';
        let text = '帧率:' + _framesPerSecond;
        if (_netDelay > 0) {
            text += ' / 延迟:' + _netDelay + 'ms';
        }
        if (_users.length > 0) {
            text += ' / 房间人数:' + _users.length;
        }
        context.fillText(text, 10, Common.height() - 5);

        //是否显示蒙蔽
        if (Status.getShowMask()) {
            //先盖一层蒙版
            context.globalAlpha = 0.5;
            context.fillStyle = '#000000';
            context.fillRect(0, 0, Common.width(), Common.height());
            context.globalAlpha = 1;
        }

        //是否显示提示信息
        if (Status.getMessage()) {
            context.font = 'bold 55px Helvetica';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillStyle = '#FFF';
            context.fillText(Status.getMessage(), Common.width() / 2, Common.height() * .4);
        }
    };
    //触屏提示圆
    this.drawTouchCycle = function (context) {
        const touchInfo = Control.getControlMode();

        if (touchInfo.touch !== true) {
            return;
        }

        //外圆
        context.globalAlpha = 0.1;
        context.fillStyle = '#FFF';
        context.beginPath();
        context.arc(touchInfo.centerX, touchInfo.centerY, touchInfo.radius, 0, 2 * Math.PI);
        context.closePath();
        context.fill();

        let x = touchInfo.touchX ? touchInfo.touchX : touchInfo.centerX;
        let y = touchInfo.touchY ? touchInfo.touchY : touchInfo.centerY;

        //内圆
        context.beginPath();
        context.arc(x, y, touchInfo.radius / 4, 0, 2 * Math.PI);
        context.closePath();
        context.fill();

        //子弹
        context.beginPath();
        context.arc(touchInfo.rightCenterX, touchInfo.rightCenterY,
            touchInfo.rightRadius, 0, 2 * Math.PI);
        context.closePath();
        context.fill();

        //喇叭
        context.beginPath();
        context.arc(touchInfo.hornCenterX, touchInfo.hornCenterY,
            touchInfo.hornRadius, 0, 2 * Math.PI);
        context.closePath();
        context.fill();

        //图层
        context.globalAlpha = 0.5;
        let image = Resource.getImage("ammo_icon");
        let size = touchInfo.rightRadius * 1.5;
        context.drawImage(image,
            0, 0,
            image.width, image.height,
            touchInfo.rightCenterX - size / 2, touchInfo.rightCenterY - size / 2,
            size, size);

        image = Resource.getImage("horn_icon");
        size = touchInfo.hornRadius * 2;
        context.drawImage(image,
            0, 0,
            image.width, image.height,
            touchInfo.hornCenterX - size / 2, touchInfo.hornCenterY - size / 2,
            size, size);
        context.globalAlpha = 1;
    };

    this.runNextStage = function () {
        if (_index >= _stages.length) {
            return;
        }
        ++_index;

        //因为选择框在场景以外，所以切换场景要强制隐藏
        Menu.getSelect().style.visibility = 'hidden';
    };
    this.runLastStage = function () {
        if (_index <= 0) {
            return;
        }
        --_index;

        //菜单特别处理
        if (_index === 0) {
            Menu.showSelect();
        }
    };

    //初始化游戏引擎
    this.init = function () {
        this.start();
    };

    const serverReady = function () {
        if (Status.getStatusValue() !== Status.getStatusPause()) {
            return;
        }
        Status.setStatus(Status.getStatusNormal());
    }
}
