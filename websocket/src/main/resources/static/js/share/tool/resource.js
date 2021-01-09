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
        this.host = "";
        this.debug = false;
        this.encrypt = new JSEncrypt();
        this.needOffset = true;
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

        //room
        this.loadRoomResource();

        //net
        this.loadNetResource();

        //shop
        this.loadShopResource();

        //rank board
        this.loadAnimationImage("rank_board", 1, "jpg");
        this.loadAnimationImage("button_next");
        this.loadAnimationImage("button_next_disable");
        this.loadAnimationImage("rank_1");
        this.loadAnimationImage("rank_2");
        this.loadAnimationImage("rank_3");

        //animation
        this.loadAnimationImage("shield", 4);
        this.loadAnimationImage("bomb", 6);

        //map unit
        this.loadAnimationImage("brick", 2);
        this.loadAnimationImage("iron", 2);
        this.loadAnimationImage("river", 2);
        this.loadAnimationImage("red_king", 2);
        this.loadAnimationImage("blue_king", 2);

        //menu
        this.loadAnimationImage("button", 1);
        this.loadAnimationImage("confirm");

        //other
        this.loadAnimationImage("star");
        this.loadAnimationImage("gold");
    }

    loadMenuResource() {
        this.loadImage("menu_background", "menu/background", "jpg");
        this.loadImage("top_mask", "menu/top_mask");
        this.loadImage("menu_setting", "menu/setting");
        this.loadImage("menu_wall", "menu/wall");
        this.loadImage("menu_bullet", "menu/bullet");
        this.loadImage("menu_head", "menu/head");

        //load setting
        this.loadImage("setting_bg", "menu/setting/bg");
        this.loadImage("setting_check", "menu/setting/check");
        this.loadImage("setting_select", "menu/setting/select");

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
        this.loadImage("mission_lock", "mission/lock");
        this.loadImage("mission", "mission/mission");
        this.loadImage("mission_rect", "mission/mission_rect");
        this.loadImage("mission_disable", "mission/mission_disable");
    }

    loadNetResource() {
        this.loadImage(
            "net_background",
            "net/background",
            "jpg"
        );

        this.loadImage(
            "net_create",
            "net/create",
            "jpg"
        );

        this.loadImage("enter", "net/enter");

        this.loadImage("join_red", "net/join_red");
        this.loadImage("join_blue", "net/join_blue");
    }

    loadRoomResource() {
        this.loadImage("player_life", "room/player_life");
        this.loadImage("enemy_life", "room/enemy_life");
        this.loadImage("room_stage", "room/stage");
        this.loadImage("room", "room/room");
        this.loadImage("room_rect", "room/rect");

        this.loadImage("bullet", "room/bullet", "png", 4);

        this.loadImage("stop", "room/stop");

        //item
        this.loadImage("item_bullet", "room/item/item_bullet");
        this.loadImage("item_clock", "room/item/item_clock");
        this.loadImage("item_ghost", "room/item/item_ghost");
        this.loadImage("item_star", "room/item/item_star");
        this.loadImage("item_shield", "room/item/item_shield");
        this.loadImage("item_red_star", "room/item/item_red_star");
        this.loadImage("item_king", "room/item/item_king");
        this.loadImage("item_life", "room/item/item_life");

        this.loadImage("room_easy", "room/easy");
        this.loadImage("room_hard", "room/hard");

        this.loadImage("room_background", "room/background/0");
        this.loadImage("room_background_1", "room/background/1", "jpg");
        this.loadImage("room_background_2", "room/background/2", "jpg");

        this.loadImage("back", "room/back");

        this.loadImage("failed", "room/failed");
        this.loadImage("success", "room/success");
        this.loadImage("success_light", "room/success_light");

        this.loadImage("button_home", "room/button_home");
        this.loadImage("button_again", "room/button_again");

        //load face
        this.loadImage("face_rect", "room/face/rect");
        this.loadImage("tank_face_rect", "room/face/tank_face_rect");
        for (let i = 1; i <= 6; ++i) {
            let id;
            if (i < 10) {
                id = "0" + i;
            } else {
                id = "" + i;
            }
            this.loadImage("face" + id, "room/face/" + id);
        }

        //load all tank images
        for (let i = 1; i <= 12; ++i) {
            let id;
            if (i < 10) {
                id = "0" + i;
            } else {
                id = "" + i;
            }
            this.loadImage("tank" + id, "room/tank/" + id, "png", 4);
        }

        //load pvp tank images
        for (let i = 1; i <= 4; ++i) {
            let id;
            if (i < 10) {
                id = "0" + i;
            } else {
                id = "" + i;
            }
            this.loadImage("red_tank" + id, "room/tank/red/" + id, "png", 4);
            this.loadImage("blue_tank" + id, "room/tank/blue/" + id, "png", 4);
        }
    }

    loadShopResource() {
        this.loadImage("shop_background", "shop/background");
        this.loadImage("shop_button", "shop/button");
        this.loadImage("shop_button_disable", "shop/button_disable");
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
        Resource.instance.user.setDebug(debug);
    }

    static getNeedOffset() {
        return Resource.instance.needOffset;
    }

    static setNeedOffset(needOffset) {
        Resource.instance.needOffset = needOffset;
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

    static calculateWindowInfo(d1, d2) {
        const info = {};

        //计算横屏或竖屏
        if (d1 > d2) {
            info.isPortrait = false;
            info.realW = d1;
            info.realH = d2;
        } else {
            info.isPortrait = true;
            info.realW = d2;
            info.realH = d1;
        }

        //计算是否为标准的16:9的屏幕
        const realScale = info.realW / info.realH;
        const formatScale = 16 / 9;
        info.formatWithWidth = realScale <= formatScale;

        //屏幕最低为720P,否则画面太模糊了
        const minWidth = 1280;
        const minHeight = 720;
        if (info.realW < minWidth && info.realH < minHeight) {
            //需要强制成最低容忍画质
            if (info.formatWithWidth) {
                //屏幕太高
                info.displayW = minWidth;
                info.displayH = minWidth / realScale;
            } else {
                //屏幕太宽
                info.displayW = minHeight * realScale;
                info.displayH = minHeight;
            }
        } else {
            //不需要变动
            info.displayW = info.realW;
            info.displayH = info.realH;
        }

        //计算绘制画面到真实画面的比例
        info.scaleForDisplayToReal = info.realH / info.displayH;

        //计算模板画面到绘制画面的比例
        const formatWidth = 1920;
        const formatHeight = 1080;
        if (info.formatWithWidth) {
            //屏幕太高
            info.formatW = formatWidth;
            info.formatH = formatWidth / realScale;
        } else {
            //屏幕太宽
            info.formatW = formatHeight * realScale;
            info.formatH = formatHeight;
        }
        info.scaleForFormatToDisplay = info.displayH / info.formatH;
        info.scaleForFormatToReal = info.scaleForFormatToDisplay * info.scaleForDisplayToReal;

        Resource.instance.windowInfo = info;
        Resource.instance.offset = {
            x: (info.formatW - formatWidth) / 2,
            y: (info.formatH - formatHeight) / 2
        };
        return info;
    }

    static getScale() {
        return Resource.instance.windowInfo.scaleForFormatToDisplay;
    }

    static getOffset() {
        return Resource.instance.offset;
    }

    static formatWidth(offset) {
        if (offset === undefined) {
            offset = Resource.getNeedOffset();
        }
        if (offset) {
            return 1920;
        } else {
            return Resource.instance.windowInfo.formatW;
        }
    }

    static formatHeight(offset) {
        if (offset === undefined) {
            offset = Resource.getNeedOffset();
        }
        if (offset) {
            return 1080;
        } else {
            return Resource.instance.windowInfo.formatH;
        }
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