
/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/11
 */

import Common from "./common.js";
import Resource from "./resource.js";

export default class Connect {
    constructor() {
        this.socketClient = null;
    }

    static status() {
        if (!Connect.instance.socketClient) {
            return false;
        }

        return Connect.instance.socketClient.readyState === WebSocket.OPEN;
    }

    static disconnect() {
        if (!Connect.status()) {
            return;
        }

        Connect.instance.socketClient.close();
    }

    static connect(id, callback) {
        Connect.disconnect();

        Connect.instance.socketClient = new WebSocket(Connect.generateSocketHost() + '/ws?name=' + id);

        Connect.instance.socketClient.onopen = function () {
            Common.addMessage("与服务器连接中...", "#FF0");
            callback();
        };

        Connect.instance.socketClient.onerror = function (response) {
            Common.addMessage("websocket error:" + response, "#F00");
        };

        Connect.instance.socketClient.onmessage = function (response) {
            Resource.getRoot().processSocketMessage(JSON.parse(response.data));
        };

        Connect.instance.socketClient.onclose = function () {
            Common.addMessage("退出多人模式", "#FF0");
        };
    }

    static send(type, value, sendTo) {
        if (!Connect.status()) {
            return;
        }

        if (!type) {
            type = "USER_MESSAGE";
        }

        let msg = JSON.stringify({
            "message": value,
            "messageType": type,
            "sendTo": sendTo
        });

        Connect.instance.socketClient.send(msg);
    }

    static generateSocketHost() {
        return Common.generateHttpHost()
            .replace("http://","ws://")
            .replace("https://","wss://");
    }
}
Connect.instance = new Connect();