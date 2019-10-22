import Config from "../../config";
import Plane from "./Plane";
import MusicMgr from "../mgr/MusicMgr";
import WeaponAK from "./Weapon/WeaponAk";

export default class Player extends Plane {
    constructor(...args) {
        super(...args);
        this.invincible = true;
        this.weaponTable.AK = new WeaponAK(this.gameScene, this);
        this.weaponTable.AK.addSupply();
    }

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

    shoot(nearestEnemy, bulletConfig) {
        super.shoot(nearestEnemy, bulletConfig);
        MusicMgr.playSound(Config.soundPath.shoot);
    }

    setScale(scaleLevel) {
        super.setScale(scaleLevel);
        this.gameScene.setLifeCount(this.scale + 1);
    }
}

window.Player = Player;
