/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/6
 */

export default class Sound {
    constructor() {
        this.sounds = new Map();
        this.sounds.set("click", new Audio('audio/click.mp3'));
        this.sounds.set("fire", new Audio('audio/fire.mp3'));
        this.sounds.set("boom", new Audio('audio/boom.mp3'));
        this.sounds.set("win", new Audio('audio/win.wav'));
        this.sounds.set("lose", new Audio('audio/lose.wav'));
        this.sounds.set("item", new Audio('audio/item.mp3'));
        this.sounds.set("bgm", new Audio('audio/bgm.mp3'));
        this.sounds.get("bgm").loop = true;
        this.sounds.forEach(function (sound) {
            sound.addEventListener('canplaythrough', function () {}, false);
        });

        //切换至后台时静音
        const thisSound = this;
        function handleVisibilityChange() {
            if (document.hidden) {
                thisSound.sounds.forEach(function (sound) {
                    sound.volume = 0;
                })
            } else  {
                thisSound.sounds.forEach(function (sound) {
                    sound.volume = 1;
                })
            }
        }
        document.addEventListener("visibilitychange", handleVisibilityChange, false);
    }

    static catchItem() {
        Sound.playSound(Sound.instance.sounds.get("item"));
    }

    static bgm() {
        //暂停其他声音
        const win = Sound.instance.sounds.get("win");
        if (!win.ended) {
            win.pause();
            win.currentTime = 0;
        }
        Sound.playSound(Sound.instance.sounds.get("bgm"));
    }

    static click() {
        Sound.playSound(Sound.instance.sounds.get("click"));
    }

    static fire() {
        Sound.playSound(Sound.instance.sounds.get("fire"));
    }

    static boom() {
        Sound.playSound(Sound.instance.sounds.get("boom"));
    }

    static win() {
        Sound.bgmPause();
        Sound.playSound(Sound.instance.sounds.get("win"));
    }

    static lose() {
        Sound.bgmPause();
        Sound.playSound(Sound.instance.sounds.get("lose"));
    }

    static bgmPause() {
        Sound.instance.sounds.get("bgm").pause();
    }

    static playSound(sound) {
        if (!sound.ended) {
            sound.pause();
            sound.currentTime = 0;
        }
        sound.play();
    }
}
Sound.instance = new Sound();
