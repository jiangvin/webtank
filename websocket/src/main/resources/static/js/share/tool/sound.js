/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/6
 */

export default class Sound {
    constructor() {
        this.sounds = new Map();
        this.sounds.set("click", {id: "click", src: 'audio/click.mp3'});
        this.sounds.set("fire", {id: "fire", src: 'audio/fire.mp3'});
        this.sounds.set("boom", {id: "boom", src: 'audio/boom.mp3'});
        this.sounds.set("item", {id: "item", src: 'audio/item.mp3'});
        this.sounds.set("win", {id: "win", src: 'audio/win.wav'});
        this.sounds.set("lose", {id: "lose", src: 'audio/lose.wav'});
        this.sounds.set("open_door", {id: "open_door", src: 'audio/open_door.mp3'});
        this.sounds.set("menu", {id: "menu", src: 'audio/menu.mp3', loop: true});
        this.sounds.set("bgm", {id: "bgm", src: 'audio/bgm.mp3', loop: true});

        this.currentLoopId = "";
    }

    static openDoor() {
        Sound.instance.sounds.get("open_door").play();
    }

    static menuBgm() {
        if (Sound.instance.currentLoopId === "menu") {
            return;
        }
        Sound.stopAll();
        Sound.instance.currentLoopId = "menu";
        Sound.instance.sounds.get("menu").play();
    }

    static catchItem() {
        Sound.instance.sounds.get("item").play();
    }

    static bgm() {
        if (Sound.instance.currentLoopId === "bgm") {
            return;
        }
        Sound.stopAll();
        Sound.instance.currentLoopId = "bgm";
        Sound.instance.sounds.get("bgm").play();
    }

    static click() {
        Sound.instance.sounds.get("click").play();
    }

    static fire() {
        Sound.instance.sounds.get("fire").play();
    }

    static boom() {
        Sound.instance.sounds.get("boom").play();
    }

    static win() {
        Sound.stopAll();
        Sound.instance.sounds.get("win").play();
    }

    static lose() {
        Sound.stopAll();
        Sound.instance.sounds.get("lose").play();
    }

    static stopAll() {
        Sound.instance.currentLoopId = "";
        Sound.instance.sounds.forEach(function (sound) {
            if (!sound.loop) {
                return;
            }
            sound.stop();
        })
    }
}
Sound.instance = new Sound();
