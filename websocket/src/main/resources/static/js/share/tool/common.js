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

    static nextStage(options) {
        Resource.getRoot().nextStage(options);
    }

    static lastStage(options) {
        Resource.getRoot().lastStage(options);
    }

    static preStage(options) {
        Resource.getRoot().preStage(options);
    }

    static gotoStage(id, options) {
        Resource.getRoot().gotoStage(id, options);
    }

    static addTimeEvent(eventType, callback, timeout) {
        Resource.getRoot().addTimeEvent(eventType, callback, timeout);
    }

    static addMessageEvent(eventType, callback) {
        Resource.getRoot().addMessageEvent(eventType, callback);
    }

    static syncUserData() {
        Resource.getUser().resetUserId();
        if (!Resource.getUser().deviceId) {
            return;
        }
        const oldCoins = Resource.getUser().coin;
        const oldStage = Resource.getUser().stage;
        Common.getRequest("/user/getUser?userId=" + Resource.getUser().deviceId, function (data) {
            Resource.setUser(data);
            const newCoins = Resource.getUser().coin;
            if (newCoins > oldCoins) {
                Common.addMessage("获得金币数量: " + (newCoins - oldCoins));
            }
            const newStage = Resource.getUser().stage;
            if (newStage > oldStage) {
                Common.addMessage("解锁新的任务关卡!");
            }
        });
    }

    static getRequest(url, callback) {
        Resource.instance.adapter.getRequest(url, callback);
    }

    static postEncrypt(url, body, callback) {
        this.postRequest(url, {data: Resource.encryptData(body)}, callback);
    }

    static postRequest(url, body, callback) {
        Resource.instance.adapter.postRequest(url, body, callback);
    };

    static saveConf() {
        Resource.instance.adapter.saveConf();
    }

    static generateHttpHost() {
        return Resource.getHost() === "" ? document.location.href.split("?")[0] : Resource.getHost();
    }

    static distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    };

    static getNearestPoint(sourceList, target) {
        let minDistance = Resource.formatWidth();
        let movePoint;
        for (let i = 0; i < sourceList.length; ++i) {
            const point = sourceList[i];
            const distance = Common.distance(
                point.x, point.y,
                target.x,
                target.y);
            if (distance < minDistance) {
                movePoint = point;
                minDistance = distance;
                break;
            }
        }
        if (!movePoint) {
            return null;
        }
        return movePoint;
    }

    static valueInBoundary(value, min, max) {
        if (value < min) {
            return min;
        } else if (value > max) {
            return max;
        } else {
            return value;
        }
    }

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

    static generateStartX(length, width, interval) {
        let x = Resource.formatWidth() / 2;
        if (length % 2 === 0) {
            x += interval / 2;
        } else {
            x -= width / 2;
        }
        x -= (Math.floor(length / 2) * (width + interval));
        return x;
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
