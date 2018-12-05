import Config from "../../config";
import Worm from "../npc/Worm";
import GameUtils from "../utils/GameUtils";

export default class WormMgr {
    constructor(world, container) {
        this.world = world;
        this.container = container;
        this.wormList = [];
        let count = Config.wormMinCount + Math.random() * (Config.wormMaxCount - Config.wormMinCount);
        for (let i = 0; i < count; i++) {
            this.wormList.push(new Worm(this.world, this.container));
        }
        this.world.registerEvent("step", this);
    }

    onStep() {
        GameUtils.cleanDestroyedNpc(this.wormList);
        if (this.wormList.length < Config.wormExistMaxCount
            && Math.random() < Config.refreshWormProbability) {
            let count = 1;
            for (let i = 0; i < count; i++) {
                this.wormList.push(new Worm(this.world, this.container));
            }
        }
    }
}
