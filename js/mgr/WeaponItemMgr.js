import Config from "../../config";
import WeaponItem from "../npc/WeaponItem";
import Utils from "../utils/Utils";

export default class WeaponItemMgr {
    constructor(gameContainer, world) {
        this.gameContainer = gameContainer;
        this.world = world;
        this.createWeaponItem();
        this.onWeaponItemAteHandler = this.onWeaponItemAte.bind(this);
        App.registerEvent("WeaponItemAte", this.onWeaponItemAteHandler);
    }

    destroy() {
        clearTimeout(this.createWeaponItemTimer);
        if (this.weaponItem) {
            this.weaponItem.destroy();
        }
        App.unregisterEvent("WeaponItemAte", this.onWeaponItemAteHandler);
    }

    onWeaponItemAte() {
        delete this.weaponItem;
        let timeout = Config.weaponItem.refreshInterval * 1000;
        this.createWeaponItemTimer = setTimeout(this.createWeaponItem.bind(this), timeout);
    }

    createWeaponItem() {
        let renderPosition = {
            x: Utils.randomInRange(Config.refreshItemOffset, Config.gameSceneWidth - Config.refreshItemOffset),
            y: Utils.randomInRange(Config.refreshItemOffset, Config.gameSceneHeight - Config.refreshItemOffset)
        };
        this.weaponItem = new WeaponItem(this.gameContainer, this.world, renderPosition);
    }
}