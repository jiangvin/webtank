import Resource from "../resource.js";
import Common from "../common.js";

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/27
 */

export default class Adapter {
    constructor() {

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
}