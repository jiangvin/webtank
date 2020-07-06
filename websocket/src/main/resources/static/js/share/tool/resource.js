/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/25
 */

import User from "./user.js"

export default class Resource {
    constructor() {
        this.root = null;
        this.canvas = null;
        this.images = new Map();
        this.user = new User();
        this.itemId = 1;
        this.scale = 1;
        this.host = "";
        this.encrypt = new JSEncrypt();
        this.encrypt.setPublicKey('MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCGLK2SvOA8W84X/w9IDld7MiO+eEFCCiCeK0czeB+yS2dsQ7FAfReeZrNznJCzJvMwr2RWir/0+xngvyZOcPCM3P1SSYZHUQXzrEGSXTcaqKGvRHEnbWnpsGacccidomfsvHYHHoeCqkprk/rWWoRiAR7HI6riwHQNb0FE/MwukwIDAQAB');
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
        this.loadAnimationImage("item_bullet", 2);
        this.loadAnimationImage("item_clock", 2);
        this.loadAnimationImage("item_ghost", 2);
        this.loadAnimationImage("item_star", 2);
        this.loadAnimationImage("item_shield", 2);
        this.loadAnimationImage("item_red_star", 2);
        this.loadAnimationImage("item_king", 2);
        this.loadAnimationImage("item_life", 2);

        //map unit
        this.loadAnimationImage("bullet", 4);
        this.loadAnimationImage("brick", 2);
        this.loadAnimationImage("iron", 2);
        this.loadAnimationImage("river", 2);
        this.loadAnimationImage("red_king", 2);
        this.loadAnimationImage("blue_king", 2);

        //menu
        this.loadAnimationImage("background_loading", 1, "jpg");
        this.loadAnimationImage("background_menu", 1, "jpg");
        this.loadAnimationImage("button", 1);
        this.loadAnimationImage("button_disabled", 1);
    }

    loadAnimationImage(imageId, widthPics, type) {
        if (!type) {
            type = "png";
        }

        const img = document.createElement('img');
        img.src = 'image/' + imageId + '.' + type;
        img.widthPics = widthPics;
        img.heightPics = 1;
        img.displayWidth = img.width / img.widthPics;
        img.displayHeight = img.height / img.heightPics;
        this.images.set(imageId, img);
    }

    static generateClientId() {
        return "generateClientId=" + Resource.instance.itemId++;
    }

    static setRoot(root) {
        Resource.instance.root = root;
    }

    static getRoot() {
        return Resource.instance.root;
    }

    static getScale() {
        return Resource.instance.scale;
    }

    static setHost(host) {
        Resource.instance.host = host;
    }

    static getHost() {
        return Resource.instance.host;
    }

    static encryptData(object) {
        return Resource.instance.encrypt.encrypt(JSON.stringify(object));
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
        Resource.instance.user.setUserId(userId);
    }

    static setUser(data) {
        Resource.getUser().setData(data);
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
            Resource.instance.loadAnimationImage(id, 1, type);
        }
        return images.get(id);
    }

    static getUnitSize() {
        return 36;
    };

    static getBulletSize() {
        return 14;
    }
}
Resource.instance = new Resource();