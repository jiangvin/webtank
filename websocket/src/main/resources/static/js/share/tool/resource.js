/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/25
 */

import Root from "../root.js"
import User from "./user.js"

export default class Resource {
    static instance = new Resource();

    constructor() {
        this.root = new Root();
        this.canvas = null;
        this.images = new Map();
        this.user = new User();
        this.itemId = 1;
        this.scale = 1;
        this.host = "localhost";
        this.initImage();
    }

    initImage() {
        //load all tank images
        for (let i = 1; i <= 12; ++i) {
            let id;
            if (i < 10) {
                id = "tank0" + i;
            } else {
                id = "tank" + i;
            }
            this.loadAnimationImage(id, 4);
        }

        //animation
        this.loadAnimationImage("shield", 4);
        this.loadAnimationImage("bomb", 6);

        //item
        this.loadAnimationImage("item_star", 2);
        this.loadAnimationImage("item_shield", 2);
        this.loadAnimationImage("item_red_star", 2);

        //map unit
        this.loadAnimationImage("bullet", 4);
        this.loadAnimationImage("brick", 2);
        this.loadAnimationImage("iron", 2);
        this.loadAnimationImage("river", 2);
        this.loadAnimationImage("red_king", 2);
        this.loadAnimationImage("blue_king", 2);
    }

    loadAnimationImage(imageId, widthPics) {
        const img = document.createElement('img');
        img.src = 'image/' + imageId + '.png';
        img.widthPics = widthPics;
        img.heightPics = 1;
        img.displayWidth = img.width / img.widthPics;
        img.displayHeight = img.height / img.heightPics;
        this.images.set(imageId, img);
    }

    static generateClientId() {
        return "generateClientId=" + Resource.instance.itemId++;
    }

    static getRoot() {
        return Resource.instance.root;
    }

    static getScale() {
        return Resource.instance.scale;
    }

    static getHost() {
        return Resource.instance.host;
    }

    static calculateScale(d1, d2) {
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

    static setUserId(userId) {
        Resource.instance.user.userId = userId;
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

    static getUnitSize = function () {
        return 36;
    };
}