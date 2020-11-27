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
        this.debug = false;
        this.encrypt = new JSEncrypt();
        this.encrypt.setPublicKey('MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCGLK2SvOA8W84X/w9IDld7MiO+eEFCCiCeK0czeB+yS2dsQ7FAfReeZrNznJCzJvMwr2RWir/0+xngvyZOcPCM3P1SSYZHUQXzrEGSXTcaqKGvRHEnbWnpsGacccidomfsvHYHHoeCqkprk/rWWoRiAR7HI6riwHQNb0FE/MwukwIDAQAB');
        this.initImage();
    }

    initImage() {
        //login
        this.loadAnimationImage("logo");
        this.loadAnimationImage("login", 1, "jpg");
        this.loadAnimationImage("button_enter");

        //menu
        this.loadMenuResource();

        //mission
        this.loadMissionResource();

        //rank board
        this.loadAnimationImage("rank_board", 1, "jpg");
        this.loadAnimationImage("button_next");
        this.loadAnimationImage("button_next_disable");
        this.loadAnimationImage("rank_1");
        this.loadAnimationImage("rank_2");
        this.loadAnimationImage("rank_3");

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
        this.loadAnimationImage("button", 1);
        this.loadAnimationImage("button_disabled", 1);
    }

    loadMenuResource() {
        this.loadImage(
            "menu_background",
            "menu/background",
            "jpg"
        );
        this.loadImage("menu_wall", "menu/wall");
        this.loadImage("menu_bullet", "menu/bullet");

        //load door
        for (let i = 0; i < 23; ++i) {
            this.loadImage("menu_door_" + i, "menu/door/" + (i + 1));
        }
    }

    loadMissionResource() {
        this.loadImage(
            "mission_background",
            "mission/background",
            "jpg"
        );
        this.loadImage("mission_easy", "mission/easy");
        this.loadImage("mission_hard", "mission/hard");
        this.loadImage("mission_map_rect", "mission/map_rect");
        this.loadImage("mission_map_rect_selected", "mission/map_rect_selected");
        this.loadImage("mission_map", "mission/map");
        this.loadImage("mission_map_disable", "mission/map_disable");
    }

    loadAnimationImage(imageId, widthPics, type) {
        this.loadImage(imageId, null, type, widthPics);
    }

    loadImage(imageId, path, type, widthPics, heightPics) {
        if (!heightPics) {
            heightPics = 1;
        }
        if (!widthPics) {
            widthPics = 1;
        }
        if (!type) {
            type = "png";
        }
        if (!path) {
            path = imageId;
        }

        const img = document.createElement('img');
        img.src = 'image/' + path + '.' + type;
        img.widthPics = widthPics;
        img.heightPics = heightPics;
        img.displayWidth = img.width / img.widthPics;
        img.displayHeight = img.height / img.heightPics;
        this.images.set(imageId, img);
    }

    static isDebug() {
        return Resource.instance.debug;
    }

    static setDebug(debug) {
        Resource.instance.debug = debug;
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
        let scaleX = width / Resource.displayW();
        let scaleY = height / Resource.displayH();
        Resource.instance.scale = scaleX > scaleY ? scaleY : scaleX;

        Resource.instance.offset = {
            x: Math.floor((width / Resource.getScale() - Resource.displayW()) / 2),
            y: Math.floor((height / Resource.getScale() - Resource.displayH()) / 2)
        };
        return Resource.instance.scale;
    }

    static getScale() {
        return Resource.instance.scale;
    }

    static getOffset() {
        return Resource.instance.offset;
    }

    static displayW() {
        return 960;
    }

    static displayH() {
        return 540;
    }

    static width() {
        return Resource.instance.canvas.width;
    }

    static height() {
        return Resource.instance.canvas.height;
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

    static getImage(id) {
        return Resource.instance.images.get(id);
    }

    /**
     * 若图片已被加载，则可以不传type
     */
    static getOrCreateImage(id, type) {
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