import Heart from "../npc/Heart";
import GameUtils from "../utils/GameUtils";
import Component from "../base/Component";
import EventMgr from "../base/EventMgr";

export default class HeartMgr extends Component {
    constructor(world, container) {
        super();
        this.eventMgr = this.createComponent(EventMgr);
        this.eventMgr.registerEvent("WormDropHeart", this.onWormExploded.bind(this));
        this.world = world;
        this.container = container;
        this.heartList = [];
        this.world.registerEvent("step", this);
    }

    onWormExploded(wormPos) {
        this.heartList.push(new Heart(this.world, this.container, wormPos));
    }

    onStep() {
        GameUtils.cleanDestroyedNpc(this.heartList);
    }

    getHeartCount() {
        return this.heartList.length;
    }
}
