import Config from "../../config";
import Item from "../npc/Item";
import EventMgr from "../base/EventMgr";
import Component from "../base/Component";

export default class ItemMgr extends Component {
    constructor(world, container) {
        super();
        this.eventMgr = this.createComponent(EventMgr);
        this.eventMgr.registerEvent("AteItem", this.onAteItem.bind(this));
        this.world = world;
        this.container = container;
        this.refreshItem();
    }

    onAteItem() {
        if (this.item && !this.item.destroyed) {
            this.item.destroy();
        }
        this.refreshItemTimer = setTimeout(this.refreshItem.bind(this), Config.refreshItemInterval * 1000);
    }

    refreshItem() {
        this.item = new Item(this.world, this.container);
    }

    destroy() {
        if (this.item && !this.item.destroyed) {
            this.item.destroy();
        }
        clearTimeout(this.refreshItemTimer);
        super.destroy();
    }
}
