/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/26
 */

import Resource from "./resource.js";

export default class Common {
    constructor() {
    }

    static addMessage(context, color) {
        Resource.getRoot().addMessage(context, color);
    }

    static nextStage() {
        Resource.getRoot().nextStage();
    }

    static lastStage() {
        Resource.getRoot().lastStage();
    }

    static addTimeEvent(eventType, callBack, timeout, ignoreLog) {
        Resource.getRoot().addTimeEvent(eventType, callBack, timeout, ignoreLog);
    }

    static addMessageEvent(eventType, callBack) {
        Resource.getRoot().addMessageEvent(eventType, callBack);
    }

    static drawTitle(ctx, message) {
        ctx.font = 'bold 55px Microsoft YaHei UI';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF';
        ctx.fillText(message, Resource.width() / 2, Resource.height() * .4);
    }

    static getRequest(url, callBack) {
        try {
            const xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState !== 4) {
                    return;
                }
                if (xmlHttp.status !== 200) {
                    Common.addMessage(xmlHttp.responseText, "#ff0000");
                    return;
                }

                const result = JSON.parse(xmlHttp.responseText);
                if (result.success) {
                    callBack(result.data);
                } else {
                    Common.addMessage(result.message, "#ff0000");
                }
            };
            xmlHttp.open("GET", Common.generateHttpHost() + encodeURI(url), true); // true for asynchronous
            xmlHttp.send(null);
        } catch (e) {
            Common.addMessage(e, "#ff0000");
        }
    }

    static postRequest(url, body, callback) {
        $.ajax({
            url: Common.generateHttpHost() + encodeURI(url),
            type: 'post',
            contentType: "application/json;charset=UTF-8",
            data: JSON.stringify(body),
            success: function (result) {
                if (!result.success) {
                    Common.addMessage(result.message, "#ff0000");
                    return;
                }
                if (callback) {
                    callback(result.data);
                }
            }
        });
    };

    static generateHttpHost() {
        return Resource.getHost() === "" ? document.location.href.split("?")[0] : Resource.getHost();
    }

    static distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    };

    static width() {
        return Resource.width();
    }

    static height() {
        return Resource.height();
    }

    static getPositionFromId(id) {
        const position = {};
        const infos = id.split("_");
        const size = Resource.getUnitSize();
        position.x = parseInt(infos[0]) * size + size / 2;
        position.y = parseInt(infos[1]) * size + size / 2;
        return position;
    };

    static getIdFromPosition(pos) {
        const size = Resource.getUnitSize();
        return Math.floor(pos.x / size) + "_" + Math.floor(pos.y / size);
    }
}

Date.prototype.format = function (fmt) {
    const o = {
        "M+": this.getMonth() + 1,                      //月份
        "d+": this.getDate(),                           //日
        "h+": this.getHours(),                          //小时
        "m+": this.getMinutes(),                        //分
        "s+": this.getSeconds(),                        //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()                     //毫秒
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
