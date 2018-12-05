import Config from "../../config";
import Meteor from "../npc/Meteor";
import GameUtils from "../utils/GameUtils";
import Utils from "../utils/Utils";

export default class MeteorMgr {
    constructor(world, container) {
        this.world = world;
        this.container = container;
        this.worldViewRect = {
            x: -Config.designWidth / 2 - Config.worldViewRectMargin,
            y: -Config.designHeight / 2 - Config.worldViewRectMargin,
            width: Config.gameSceneWidth + Config.designWidth + Config.worldViewRectMargin * 2,
            height: Config.gameSceneHeight + Config.designHeight + Config.worldViewRectMargin * 2
        };
        this.meteorList = [];
        let count = Config.meteorMinCount + Math.random() * (Config.meteorMaxCount - Config.meteorMinCount);
        for (let i = 0; i < count; i++) {
            this.meteorList.push(new Meteor(this.world, this.container, true));
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

        this.meteorList.forEach(meteor => {
            if (!Utils.isPointInRect(meteor.sprite.position, this.worldViewRect)) {
                meteor.exploded = true;
            }
        });
    }

    getMeteorCount() {
        return this.meteorList.length;
    }
}
