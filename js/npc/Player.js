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

    shoot(nearestEnemy) {
        super.shoot(nearestEnemy);
        MusicMgr.playSound(Config.soundPath.shoot);
    }
}

window.Player = Player;
