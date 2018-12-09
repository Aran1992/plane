import Config from "../../config";
import Item from "../npc/Item";
import GameUtils from "../utils/GameUtils";

export default class ItemMgr {
    constructor(world, container) {
        this.world = world;
        this.container = container;
        this.refreshItemTimer = setInterval(this.refreshItem.bind(this), Config.refreshItemInterval * 1000);
    }

    refreshItem() {
        if (this.item && !this.item.destroyed) {
            this.item.destroy();
        }
        this.item = new Item(this.world, this.container,
            GameUtils.renderPos2PhysicsPos({x: Config.gameSceneWidth / 2, y: Config.gameSceneHeight / 2}));
    }

    destroy() {
        clearInterval(this.refreshItemTimer);
    }
}
