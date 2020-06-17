/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/6
 */

export default class Sound {
    constructor() {
        this.clickSound = new Audio();
        this.clickSound.src = 'audio/click.mp3';

        this.fireSound = new Audio();
        this.fireSound.src = 'audio/fire.mp3';

        this.boomSound = new Audio();
        this.boomSound.src = 'audio/boom.mp3';

        this.winSound = new Audio();
        this.winSound.src = 'audio/win.wav';

        this.loseSound = new Audio();
        this.loseSound.src = 'audio/lose.wav';

        this.itemSound = new Audio();
        this.itemSound.src = 'audio/item.mp3';

        this.bgmSound = new Audio();
        this.bgmSound.loop = true;
        this.bgmSound.src = 'audio/bgm.mp3';
    }

    static catchItem() {
        Sound.playSound(Sound.instance.itemSound);
    }

    static bgm() {
        Sound.playSound(Sound.instance.bgmSound);
    }

    static click() {
        Sound.playSound(Sound.instance.clickSound);
    }

    static fire() {
        Sound.playSound(Sound.instance.fireSound);
    }

    static boom() {
        Sound.playSound(Sound.instance.boomSound);
    }

    static win() {
        Sound.instance.bgmSound.pause();
        Sound.playSound(Sound.instance.winSound);
    }

    static lose() {
        Sound.instance.bgmSound.pause();
        Sound.playSound(Sound.instance.loseSound);
    }

    static bgmPause() {
        Sound.instance.bgmSound.pause();
    }

    static playSound(sound) {
        if (!sound.ended) {
            sound.load();
        }
        sound.play();
    }
}
Sound.instance = new Sound();
