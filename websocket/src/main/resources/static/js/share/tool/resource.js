/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/25
 */

import User from "./user.js"

export default class Resource {
    static instance = new Resource();

    constructor() {
        this.canvas = null;
        this.images = new Map();
        this.user = new User();
        this.itemId = 1;
        this.scale = 1;
    }

    static generateClientId() {
        return "generateClientId=" + Resource.instance.itemId++;
    }

    static calculateScale(d1,d2) {
        let width;
        let height;
        if (d1 > d2) {
            width = d1;
            height = d2;
        } else {
            width = d2;
            height = d1;
        }
        let scaleX = width / 800;
        let scaleY = height / 500;
        Resource.instance.scale = scaleX > scaleY ? scaleY : scaleX;
        Resource.instance.scale = Resource.instance.scale < 1 ? Resource.instance.scale : 1;
        return Resource.instance.scale;
    }

    static setCanvas(canvas) {
        Resource.instance.canvas = canvas;
    }

    static setUsername(username) {
        Resource.instance.user.username = username;
    }

    static getUser() {
        return Resource.instance.user;
    }

    static width() {
        return Resource.instance.canvas.width;
    }

    static height() {
        return Resource.instance.canvas.height;
    }

    static getImage(id, type) {
        const images = Resource.instance.images;
        if (!images.has(id)) {
            const widthPics = 1;
            const heightPics = 1;
            const img = document.createElement('img');
            if (!type) {
                type = "png";
            }
            img.src = 'image/' + id + '.' + type;
            img.widthPics = widthPics;
            img.heightPics = heightPics;
            img.displayWidth = img.width / img.widthPics;
            img.displayHeight = img.height / img.heightPics;
            images.set(id, img);
        }
        return images.get(id);
    }
}