import Config from "../../config";
import Item from "../npc/Item";
import EventMgr from "../base/EventMgr";
import Component from "../base/Component";
import Utils from "../utils/Utils";

export default class ItemMgr extends Component {
    constructor(world, container) {
        super();
        this.eventMgr = this.createComponent(EventMgr);
        this.eventMgr.registerEvent("AteItem", this.onAteItem.bind(this));
        this.world = world;
        this.container = container;
        this.refreshItem(Config.refreshItemInitPos);
    }

    onAteItem() {
        if (this.item && !this.item.destroyed) {
            this.item.destroy();
        }
        this.refreshItemTimer = setTimeout(this.refreshItem.bind(this), Config.refreshItemInterval * 1000);
    }

    refreshItem(renderPos) {
        renderPos = renderPos || {
            x: Utils.randomInRange(Config.refreshItemOffset, Config.gameSceneWidth - Config.refreshItemOffset),
            y: Utils.randomInRange(Config.refreshItemOffset, Config.gameSceneHeight - Config.refreshItemOffset)
        };
        this.item = new Item(this.world, this.container, renderPos);
    }

    destroy() {
        if (this.item && !this.item.destroyed) {
            this.item.destroy();
        }
        clearTimeout(this.refreshItemTimer);
        super.destroy();
    }
}
