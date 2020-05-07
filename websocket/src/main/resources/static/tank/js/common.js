const Common = function () {
};

Common.extend = function (target, settings, params) {
    params = params || {};
    for (let i in settings) {
        target[i] = params[i] || settings[i];
    }
    return target;
};

let _canvas;
Common.getCanvas = function () {
    if (!_canvas) {
        _canvas = document.getElementById("canvas");

        //自动跟随窗口变化
        //先手动调用一次，再绑定事件
        Common.windowChange();
        window.addEventListener("resize", function () {
            Common.windowChange();
        });
    }
    return _canvas;
};
Common.width = function () {
    return Common.getCanvas().width;
};
Common.height = function () {
    return Common.getCanvas().height;
};
Common.windowChange = function () {
    const width = window.innerWidth;
    const height = window.innerHeight;

    let style = "";
    if (width >= height) { // 横屏
        style += "width:" + width + "px;";  // 注意旋转后的宽高切换
        style += "height:" + height + "px;";
        style += "-webkit-transform: rotate(0); transform: rotate(0);";
        style += "-webkit-transform-origin: 0 0;";
        style += "transform-origin: 0 0;";
        _canvas.width = width;
        _canvas.height = height;
    } else { // 竖屏
        style += "width:" + height + "px;";
        style += "height:" + width + "px;";
        style += "-webkit-transform: rotate(90deg); transform: rotate(90deg);";
        // 注意旋转中点的处理
        style += "-webkit-transform-origin: " + width / 2 + "px " + width / 2 + "px;";
        style += "transform-origin: " + width / 2 + "px " + width / 2 + "px;";
        _canvas.width = height;
        _canvas.height = width;
    }
    let wrapper = document.getElementById("wrapper");
    wrapper.style.cssText = style;
    Common.generateTouchInfo(height > width);
};

//操控相关
let _touchControl = {"touch": null};
Common.generateTouchInfo = function (portrait) {
    let centerX = Common.width() / 4 / 2;
    let centerY = Common.height() / 2 / 2;
    let radius = centerX > centerY ? centerY : centerX;
    centerY *= 3;

    let rightCenterX = centerX * 7;
    let rightCenterY = centerY;
    let rightRadius = radius * .7;

    if (centerX - radius < 20) {
        rightCenterX -= 20;
        centerX += 20;
    }
    if (Common.height() - centerY - radius < 20) {
        rightCenterY -= 20;
        centerY -= 20;
    }

    _touchControl.centerX = centerX;
    _touchControl.centerY = centerY;
    _touchControl.radius = radius;

    _touchControl.rightCenterX = rightCenterX;
    _touchControl.rightCenterY = rightCenterY;
    _touchControl.rightRadius = rightRadius;

    _touchControl.hornCenterX = rightCenterX + rightRadius;
    _touchControl.hornCenterY = rightCenterY - rightRadius * .95;
    _touchControl.hornRadius = radius / 4;

    _touchControl.portrait = portrait;
};
Common.setTouch = function (touch) {
    if (_touchControl.touch !== null) {
        return;
    }
    _touchControl.touch = touch;
    const input = $('#input');
    if (_touchControl.touch) {
        input.attr("placeholder", "请输入信息,再次点击喇叭发送");
        Common.bindTouch();
    } else {
        input.attr("placeholder", "请输入信息,回车发送");
        Common.bindKeyboard();
    }

};
Common.getTouchInfo = function () {
    return _touchControl;
};
Common.getTouch = function () {
    return _touchControl.touch;
};
Common.bindKeyboard = function () {
    window.addEventListener("keydown", function (e) {
        let event = null;
        switch (e.key) {
            case "Up":
            case "ArrowUp":
                event = "Up";
                break;
            case "Down":
            case "ArrowDown":
                event = "Down";
                break;
            case "Left":
            case "ArrowLeft":
                event = "Left";
                break;
            case "Right":
            case "ArrowRight":
                event = "Right";
                break;
            default:
                break;
        }
        if (event != null) {
            Resource.getGame().controlEvent(event);
        }
    });
    window.addEventListener('keyup', function (e) {
        let event = null;
        switch (e.key) {
            case "ArrowUp":
            case "ArrowDown":
            case "ArrowLeft":
            case "ArrowRight":
            case "Up":
            case "Down":
            case "Left":
            case "Right":
                event = "Stop";
                break;
            default:
                break;
        }
        if (event != null) {
            Resource.getGame().controlEvent(event);
        }
    });
};
Common.bindTouch = function () {
    window.addEventListener('touchstart', function (e) {
        const touchPoint = Common.getTouchPoint(e.touches[0]);
        let x = touchPoint.x;
        let y = touchPoint.y;

        const distance = Common.distance(x, y, _touchControl.centerX, _touchControl.centerY);
        if (distance > _touchControl.radius) {
            //超过外圆，不做任何操作
            return;
        }

        _touchControl.touchX = x;
        _touchControl.touchY = y;
        Resource.getGame().controlEvent(Common.getEventFromTouch());
    });
    window.addEventListener('touchend', function (e) {
        //所有手指都离开屏幕才算坦克停止
        if (e.touches.length === 0) {
            _touchControl.touchX = null;
            _touchControl.touchY = null;
            Resource.getGame().controlEvent("Stop");
        }
    });
    window.addEventListener('touchmove', function (e) {
        const touchPoint = Common.getTouchPoint(e.touches[0]);
        let x = touchPoint.x;
        let y = touchPoint.y;

        const distance = Common.distance(x, y, _touchControl.centerX, _touchControl.centerY);
        const radius = _touchControl.radius;
        if (distance <= radius) {
            _touchControl.touchX = x;
            _touchControl.touchY = y;
        } else {
            if (_touchControl.touchX == null || _touchControl.touchY == null) {
                //从头到尾都超过外圆，不做任何操作
                return;
            }
            //开始计算圆外的点和圆心连线的交点
            //先将圆心移动到坐标原点
            x = x - _touchControl.centerX;
            y = y - _touchControl.centerY;

            if (x === 0) {
                //x在坐标轴上，特殊处理，不能当公式分母
                y = y >= 0 ? radius : -radius;
            } else {
                let newX;
                let newY;
                newX = Math.sqrt(radius * radius * x * x / (x * x + y * y));
                newY = y * newX / x;
                if (x < 0) {
                    newX = -newX;
                    newY = -newY;
                }
                x = newX;
                y = newY;
            }

            //再将圆心移回去
            _touchControl.touchX = x + _touchControl.centerX;
            _touchControl.touchY = y + _touchControl.centerY;
        }
        Resource.getGame().controlEvent(Common.getEventFromTouch());
    });
};
Common.getEventFromTouch = function () {
    let xLength = Math.abs(_touchControl.touchX - _touchControl.centerX);
    let yLength = Math.abs(_touchControl.touchY - _touchControl.centerY);
    if (xLength > yLength) {
        if (_touchControl.touchX < _touchControl.centerX) {
            return "Left";
        } else {
            return "Right";
        }
    } else {
        if (_touchControl.touchY < _touchControl.centerY) {
            return "Up";
        } else {
            return "Down";
        }
    }
};
Common.getTouchPoint = function (eventPoint) {
    let x = eventPoint.clientX;
    let y = eventPoint.clientY;

    const touchPoint = {};
    if (_touchControl.portrait) {
        //竖屏
        touchPoint.x = y;
        touchPoint.y = Common.height() - x;
    } else {
        //横屏
        touchPoint.x = x;
        touchPoint.y = y;
    }
    return touchPoint;
};

let _context;
Common.getContext = function () {
    if (!_context) {
        const canvas = this.getCanvas();
        _context = canvas.getContext('2d');
    }
    return _context;
};

//按钮
Common.buttonBind = function (callback) {
    //先删除之前的事件
    Common.buttonUnbind();
    $('#button1').bind('click', callback);
    $('#button2').bind('click', callback);
};
Common.buttonUnbind = function () {
    $('#button1').unbind('click');
    $('#button2').unbind('click');
};
Common.buttonEnable = function (enable) {
    document.getElementById('button1').style.visibility = enable ? 'visible' : 'hidden';
    document.getElementById('button2').style.visibility = enable ? 'visible' : 'hidden';
};

//输入框
let _bindMessageControl;
let _inputEnable = true;
Common.inputText = function () {
    return $('#input').val();
};
Common.inputEnable = function (enable) {
    _inputEnable = enable;
    document.getElementById('input').style.visibility = _inputEnable ? 'visible' : 'hidden';
};
Common.inputResize = function () {
    const input = $('#input');
    input.val("");
    input.removeClass("input-name");
    input.addClass("input-message");
};
Common.inputBindMessageControl = function () {
    if (_bindMessageControl) {
        return;
    }

    _bindMessageControl = true;
    Common.inputBindKeyboard();

    if (Common.getTouch() === true) {
        Common.inputBindTouch();
    }
};
Common.inputBindKeyboard = function () {
    window.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            Common.inputMessageEvent(true);
        }
    });
};
Common.inputBindTouch = function () {
    window.addEventListener('touchstart', function (e) {
        const touchPoint = Common.getTouchPoint(e.touches[0]);
        let x = touchPoint.x;
        let y = touchPoint.y;

        const distance = Common.distance(x, y, _touchControl.hornCenterX, _touchControl.hornCenterY);
        if (distance > _touchControl.hornRadius) {
            //超过外圆，不做任何操作
            return;
        }
        Common.inputMessageEvent();
    });
};
Common.inputMessageEvent = function (inputFocus) {
    const input = $('#input');
    if (_inputEnable) {
        //关闭输入框
        //关闭输入框前先处理文字信息
        const text = input.val();
        if (text !== "") {
            Common.sendStompMessage(text);
            input.val("");
        }
        _inputEnable = !_inputEnable;
        Common.inputEnable(_inputEnable);
    } else {
        //打开输入框
        _inputEnable = !_inputEnable;
        Common.inputEnable(_inputEnable);
        if (inputFocus) {
            input.focus();
        }
    }
};

Common.addMessage = function (context, color) {
    Resource.getGame().addMessage(context, color);
};

Common.runNextStage = function () {
    Resource.getGame().runNextStage();
};
Common.runLastStage = function () {
    Resource.getGame().runLastStage();
};

//stomp connect
Common.getStompStatus = function () {
    const stompClient = Resource.getStompClient();
    if (!stompClient) {
        return false;
    }
    return stompClient.connected;
};
Common.getStompInfo = function () {
    const stompInfo = {};
    const url = Resource.getStompClient().ws._transport.url;
    stompInfo.username = decodeURI(url.substring(url.lastIndexOf("=") + 1));

    //get socket session id
    const end = url.lastIndexOf("/");
    const start = url.substring(0, end).lastIndexOf("/");
    stompInfo.socketSessionId = url.substring(start + 1, end);
    return stompInfo;
};
Common.stompConnect = function (name, callback) {
    const socket = new SockJS(encodeURI('/websocket-simple?name=' + name));
    const stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        Common.addMessage("网络连接中: " + frame, "#ffffff");

        // 客户端订阅消息, 公共消息和私有消息
        stompClient.subscribe('/topic/send', function (response) {
            Resource.getGame().receiveStompMessage(JSON.parse(response.body));
        });
        stompClient.subscribe('/user/queue/send', function (response) {
            Resource.getGame().receiveStompMessage(JSON.parse(response.body));
        });
        Resource.setStompClient(stompClient);
        callback();
    });
};
Common.sendStompMessage = function (message, messageType, sendTo) {
    const stompClient = Resource.getStompClient();
    if (!stompClient) {
        return;
    }

    if (!messageType) {
        messageType = "USER_MESSAGE";
    }

    stompClient.send("/send", {},
        JSON.stringify({
            "message": message,
            "messageType": messageType,
            "sendTo": sendTo
        }));
};

//tools
Common.distance = function (x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};
Common.getRequest = function (url, callBack) {
    $.getJSON(encodeURI(url), function (result) {
        if (!result.success) {
            Common.addMessage(result.message, "#ff0000");
            return;
        }
        callBack(result.data);
    });
};
Common.postRequest = function (url, headers, body, callbackSuccess, callBackFailed) {
    $.ajax({
        url: encodeURI(url),
        type: 'post',
        data: body,
        headers: headers,
        dataType: 'json',
        success: function (result) {
            if (!result.success) {
                Common.addMessage(result.message, "#ff0000");
                if (callBackFailed) {
                    callBackFailed();
                }
                return;
            }
            if (callbackSuccess) {
                callbackSuccess(result.data);
            }
        }
    });
};

//expand
Date.prototype.format = function (fmt) {
    const o = {
        "M+": this.getMonth() + 1,               //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (let k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};