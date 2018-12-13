class MusicMgr_ {
    constructor() {
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
