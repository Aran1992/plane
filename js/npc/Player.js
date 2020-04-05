import Config from "../../config";
import Plane from "./Plane";
import MusicMgr from "../mgr/MusicMgr";

export default class Player extends Plane {
    onAteItem(type) {
        super.onAteItem(type);
        MusicMgr.playSound(Config.soundPath.pickItem);
    }

    onAteConfused() {
        super.onAteConfused();
        MusicMgr.playSound(Config.soundPath.confused);
    }

    setBombCount(count) {
        super.setBombCount(count);
        this.gameScene.setBombCount(count);
    }

    shoot(...args) {
        super.shoot(...args);
        MusicMgr.playSound(Config.soundPath.shoot);
    }

    setScale(scaleLevel) {
        super.setScale(scaleLevel);
        this.gameScene.setLifeCount(this.scale + 1);
    }
}

window.Player = Player;
