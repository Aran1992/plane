class MusicMgr_ {
    constructor() {
        this.bgmAudio = document.createElement("audio");
        this.bgmAudio.loop = true;
        this.bgmAudio.autoplay = true;
    }

    playBGM(path) {
        this.bgmAudio.src = path;
        this.bgmAudio.onload = () => {
            this.bgmAudio.play();
        };
    }

    pauseBGM() {
        this.bgmAudio.pause();
    }

    playSound(path, loop) {
        let audio = new Audio();
        audio.src = path;
        audio.autoplay = true;
        audio.loop = loop;
        audio.play();
        return audio;
    }
}

const MusicMgr = new MusicMgr_();
export default MusicMgr;
