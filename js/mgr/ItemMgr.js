import Config from "../../config";
import Manager from "../base/Manager";
import Item from "../npc/Item";
import Utils from "../utils/Utils";

export default class ItemMgr extends Manager {
    onCreate(container, world, type, imagePathList, config) {
        this.container = container;
        this.world = world;
        this.type = type;
        this.imagePathList = imagePathList;
        this.config = config;
        this.itemList = [];

        let angle = Math.random() * Math.PI * 2;
        let distance = Utils.randomInRange(300, 500);
        this.refreshItem({
            x: Config.gameSceneWidth / 2 + Math.cos(angle) * distance,
            y: Config.gameSceneHeight / 2 + Math.sin(angle) * distance
        });
    }

    destroy() {
        this.itemList.forEach(item => item.destroy());
        clearTimeout(this.refreshItemTimer);
        super.destroy();
    }

    refreshItem(renderPos) {
        renderPos = renderPos || {
            x: Utils.randomInRange(Config.refreshItemOffset, Config.gameSceneWidth - Config.refreshItemOffset),
            y: Utils.randomInRange(Config.refreshItemOffset, Config.gameSceneHeight - Config.refreshItemOffset)
        };
        this.itemList.push(new Item(this, this.container, this.world, this.type, this.imagePathList, this.config, renderPos));
    }

    onAteItem() {
        if (this.itemList.length !== 0) {
            return;
        }
        this.refreshItemTimer = setTimeout(this.refreshItem.bind(this), this.config.refreshInterval * 1000);
    }

    removeChild(child) {
        Utils.removeItemFromArray(this.itemList, child);
    }
}
