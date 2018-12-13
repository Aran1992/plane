import GameUtils from "../utils/GameUtils";
import Animation from "../npc/Animation";

export default class AnimationMgr {
    constructor(world, container) {
        this.world = world;
        this.container = container;
        this.animationList = [];
        this.world.registerEvent("step", this);
    }

    createAnimation(pathList, pos,rotation) {
        this.animationList.push(new Animation(this.world, this.container, pathList, pos,rotation));
    }

    onStep() {
        GameUtils.cleanDestroyedNpc(this.animationList);
    }

    destroy() {
        this.animationList.forEach(animation => !animation.destroyed && animation.destroy());
        this.animationList = undefined;
        this.world.unregisterEvent("step", this);
    }
}
