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
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    Control.generateTouchModeInfo(height > width);
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

    if (Control.getControlMode().touch === true) {
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

        const controlMode = Control.getControlMode();
        const distance = Common.distance(x, y, controlMode.hornCenterX, controlMode.hornCenterY);
        if (distance > controlMode.hornRadius) {
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

//stomp connect
Common.getStompStatus = function () {
    const stompClient = Resource.getStompClient();
    if (!stompClient) {
        return false;
    }
    return stompClient.connected;
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

//game tools
Common.addMessage = function (context, color) {
    Resource.getGame().addMessage(context, color);
};
Common.runNextStage = function () {
    Resource.getGame().runNextStage();
};
Common.runLastStage = function () {
    Resource.getGame().runLastStage();
};
Common.getRandomTankImage = function () {
    const id = Math.floor(Math.random() * 9) + 1;
    return Resource.getImage("tank0" + id);
};

//general tools
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