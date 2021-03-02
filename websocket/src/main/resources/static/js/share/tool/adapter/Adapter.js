import Resource from "../resource.js";
import Common from "../common.js";
import Home from "../../../web/home.js";
import Loading from "../../../web/loading.js";

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/27
 */

export default class Adapter {
    constructor() {

        //在手机上禁用滑动
        this.lockTouchMoveEvent = function (e) {
            // 判断默认行为是否可以被禁用
            if (e.cancelable) {
                // 判断默认行为是否已经被禁用
                if (!e.defaultPrevented) {
                    e.preventDefault();
                }
            }
        }
    }

    initGame(callback) {
        Resource.getRoot().addStage(new Home());
        Resource.getRoot().addStage(new Loading());
        Resource.getRoot().addGameStage();
        callback();
    }

    lockTouchMove() {
        document.body.addEventListener('touchmove', this.lockTouchMoveEvent, {passive: false});
    }

    unlockTouchMove() {
        document.body.removeEventListener('touchmove', this.lockTouchMoveEvent);
    }

    getRequest(url, callback) {
        try {
            const xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState !== 4) {
                    return;
                }
                if (xmlHttp.status !== 200) {
                    Resource.getRoot().addMessage(xmlHttp.responseText, "#ff0000");
                    return;
                }

                const result = JSON.parse(xmlHttp.responseText);
                if (result.success) {
                    callback(result.data);
                } else {
                    Resource.getRoot().addMessage(result.message, "#ff0000");
                }
            };
            xmlHttp.open("GET", Common.generateHttpHost() + encodeURI(url), true); // true for asynchronous
            xmlHttp.send(null);
        } catch (e) {
            Resource.getRoot().addMessage(e, "#ff0000");
        }
    }

    postRequest(url, body, callback) {
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
                    if (callback) {
                        callback(result.data);
                    }
                } else {
                    Common.addMessage(result.message, "#ff0000");
                }
            };
            xmlHttp.open("POST", Common.generateHttpHost() + encodeURI(url), true); // true for asynchronous
            xmlHttp.setRequestHeader('content-type', 'application/json');
            xmlHttp.send(JSON.stringify(body));
        } catch (e) {
            Common.addMessage(e, "#ff0000");
        }
    }

    /**
     * 网页模式不能存文件
     */
    saveConf() {
        console.log("mock save configuration");
    }
}