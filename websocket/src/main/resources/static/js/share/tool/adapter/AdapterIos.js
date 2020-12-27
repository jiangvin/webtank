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

    requestCallback(resultStr, id) {
        const result = JSON.parse(resultStr);
        if (!this.iosCallbackMap.has(id)) {
            return;
        }

        const callback = this.iosCallbackMap.get(id);
        this.iosCallbackMap.delete(id);
        if (result.success) {
            callback(result.data);
        } else {
            Resource.getRoot().addMessage(result.message, "#ff0000");
        }
    }
}