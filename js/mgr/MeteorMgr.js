import Config from "../../config";
import Meteor from "../npc/Meteor";
import GameUtils from "../utils/GameUtils";

export default class MeteorMgr {
    constructor(world, container) {
        this.world = world;
        this.container = container;
        this.meteorList = [];
        let count = Config.meteorMinCount + Math.random() * (Config.meteorMaxCount - Config.meteorMinCount);
        for (let i = 0; i < count; i++) {
            this.meteorList.push(new Meteor(this.world, this.container));
        }
        this.world.registerEvent("step", this);
    }

    onStep() {
        GameUtils.cleanDestroyedNpc(this.meteorList);
        if (this.meteorList.length < Config.meteorExistMaxCount
            && Math.random() < Config.refreshMeteorProbability) {
            let count = Config.refreshMeteorMinCount +
                Math.random() * (Config.refreshMeteorMaxCount - Config.refreshMeteorMinCount);
            for (let i = 0; i < count; i++) {
                this.meteorList.push(new Meteor(this.world, this.container));
            }
        }
    }
}
