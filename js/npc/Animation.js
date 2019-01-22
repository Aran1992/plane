import {resources, Sprite} from "../libs/pixi-wrapper";
import Config from "../../config";

export default class Animation {
    constructor(world, container, pathList, pos, rotation) {
        this.world = world;
        this.container = container;
        this.frames = pathList.map(path => resources[path].texture);
        this.frameIndex = 0;
        this.sprite = new Sprite(this.frames[0]);
        this.container.addChild(this.sprite);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.position.set(pos.x, pos.y);
        this.sprite.rotation = rotation || 0;
        this.world.registerEvent("step", this);
    }

    onStep() {
        let originFrame = Math.floor(this.frameIndex / Config.frameInterval);
        this.frameIndex++;
        let newFrame = Math.floor(this.frameIndex / Config.frameInterval);
        if (originFrame !== newFrame) {
            if (this.frames[newFrame] === undefined) {
                this.destroy();
            } else {
                this.sprite.texture = this.frames[newFrame];
            }
        }
    }

    destroy() {
        this.world.unregisterEvent("step", this);
        this.sprite.parent.removeChild(this.sprite);
        this.sprite = undefined;
        this.frames = undefined;
        this.destroyed = true;
    }

    isDestroyed() {
        return this.destroyed;
    }
}
