import Config from "../../config";
import Meteor from "../npc/Meteor";
import GameUtils from "../utils/GameUtils";
import Utils from "../utils/Utils";

export default class MeteorMgr {
    constructor(world, container) {
        this.world = world;
        this.container = container;
        this.meteorList = [];
        let count = Config.meteorMinCount + Math.random() * (Config.meteorMaxCount - Config.meteorMinCount);
        for (let i = 0; i < count; i++) {
            this.meteorList.push(new Meteor(this.world, this.container, true));
        }
        this.world.registerEvent("step", this);
        this.countBySeconds = [];
        for (let seconds in Config.meteor.countBySeconds) {
            if (Config.meteor.countBySeconds.hasOwnProperty(seconds)) {
                this.countBySeconds.push([parseInt(seconds), Config.meteor.countBySeconds[seconds]]);
            }
        }
    }

    onStep() {
        GameUtils.cleanDestroyedNpc(this.meteorList);

        let curSeconds = App.getScene("GameScene").survivalTime / Config.fps;
        this.maxCount = this.countBySeconds.find(([seconds]) => curSeconds < seconds)
            || Utils.getLast(this.countBySeconds);
        this.maxCount = this.maxCount[1];

        if (this.meteorList.length < this.maxCount
            && Math.random() < Config.refreshMeteorProbability) {
            let count = Config.refreshMeteorMinCount +
                Math.random() * (Config.refreshMeteorMaxCount - Config.refreshMeteorMinCount);
            for (let i = 0; i < count; i++) {
                this.meteorList.push(new Meteor(this.world, this.container));
            }
        }
    }

    getMeteorCount() {
        return this.meteorList.length;
    }
}
