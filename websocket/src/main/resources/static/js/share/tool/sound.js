/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/6
 */

export default class Sound {
    constructor() {
        this.sounds = new Map();
        this.addSound({id: "click", src: 'audio/click.mp3'});
        this.addSound({id: "fire", src: 'audio/fire.mp3'});
        this.addSound({id: "boom", src: 'audio/boom.mp3'});
        this.addSound({id: "item", src: 'audio/item.mp3'});
        this.addSound({id: "win", src: 'audio/win.wav'});
        this.addSound({id: "lose", src: 'audio/lose.wav'});
        this.addSound({id: "open_door", src: 'audio/open_door.mp3'});
        this.addSound({id: "menu", src: 'audio/menu.mp3', loop: true});
        this.addSound({id: "bgm", src: 'audio/bgm.mp3', loop: true});

        this.currentLoopId = "";
        this.soundEnable = true;
        this.musicEnable = true;
    }

    addSound(sound) {
        this.sounds.set(sound.id, sound);
    }

    playAudio(id) {
        if (!this.sounds.has(id)) {
            return;
        }

        const audio = this.sounds.get(id);
        if (audio.loop && !this.musicEnable) {
            return;
        }
        if (!audio.loop && !this.soundEnable) {
            return;
        }
        if (audio.play) {
            audio.play();
        }
    }

    static setSoundEnable(enable) {
        Sound.instance.soundEnable = enable;
    }

    static setMusicEnable(enable) {
        if (Sound.instance.musicEnable === enable) {
            return;
        }
        Sound.instance.musicEnable = enable;
        if (enable) {
            Sound.menuBgm();
        } else {
            Sound.stopAll();
        }
    }

    static openDoor() {
        Sound.instance.playAudio("open_door");
    }

    static menuBgm() {
        if (Sound.instance.currentLoopId === "menu") {
            return;
        }
        Sound.stopAll();
        Sound.instance.currentLoopId = "menu";
        Sound.instance.playAudio("menu");
    }

    static catchItem() {
        Sound.instance.playAudio("item");
    }

    static bgm() {
        if (Sound.instance.currentLoopId === "bgm") {
            return;
        }
        Sound.stopAll();
        Sound.instance.currentLoopId = "bgm";
        Sound.instance.playAudio("bgm");
    }

    static click() {
        Sound.instance.playAudio("click");
    }

    static fire() {
        Sound.instance.playAudio("fire");
    }

    static boom() {
        Sound.instance.playAudio("boom");
    }

    static win() {
        Sound.stopAll();
        Sound.instance.playAudio("win");
    }

    static lose() {
        Sound.stopAll();
        Sound.instance.playAudio("lose");
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
