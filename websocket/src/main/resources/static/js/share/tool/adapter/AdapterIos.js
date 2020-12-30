/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/27
 */
import Adapter from "./Adapter.js";
import Resource from "../resource.js";

export default class AdapterIos extends Adapter {
    constructor() {
        super();

        /**
         * ios的网络访问靠APP代理完成
         */
        this.iosCallbackMap = new Map();
    }

    getRequest(url, callback) {
        const id = Resource.generateClientId();
        this.iosCallbackMap.set(id, callback);
        window.webkit.messageHandlers.getBridge.postMessage({
            url: url,
            id: id
        });
    }

    postRequest(url, body, callback) {
        const id = Resource.generateClientId();
        this.iosCallbackMap.set(id, callback);
        window.webkit.messageHandlers.postBridge.postMessage({
            url: url,
            id: id,
            body: body
        });
    }

    requestCallback(data, id) {
        if (!this.iosCallbackMap.has(id)) {
            return;
        }

        const result = JSON.parse(this.b64DecodeUnicode(data));
        if (result.success) {
            const callback = this.iosCallbackMap.get(id);
            this.iosCallbackMap.delete(id);
            if (callback) {
                callback(result.data);
            }
        } else {
            Resource.getRoot().addMessage(result.message, "#ff0000");
        }
    }

    b64DecodeUnicode(str) {
        // Going backwards: from byte stream, to percent-encoding, to original string.
        return decodeURIComponent(atob(str).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }
}