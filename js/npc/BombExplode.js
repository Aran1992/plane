import {Circle} from "../libs/planck-wrapper";
import Config from "../../config";
import {resources, Sprite} from "../libs/pixi-wrapper";
import GameUtils from "../utils/GameUtils";

export default class BombExplode {
    constructor(world, container, pos) {
        this.world = world;
        this.container = container;

        this.frames = Config.imagePath.bombExplode.map(path => resources[path].texture);
        this.frameIndex = -1;

        this.sprite = new Sprite();
        this.container.addChild(this.sprite);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.position.set(pos.x, pos.y);

        this.body = this.world.createBody();
        this.body.setUserData(this);
        this.body.setPosition(GameUtils.renderPos2PhysicsPos(pos));

        this._updateFrame();

        this.world.registerEvent("step", this);
    }

    onStep() {
        this._updateFrame();
    }

    _updateFrame() {
        let originFrame = Math.floor(this.frameIndex / Config.frameInterval);
        this.frameIndex++;
        let frame = Math.floor(this.frameIndex / Config.frameInterval);
        if (this.frames[frame]) {
            if (this.frames[frame] === undefined) {
                this.frameIndex = 0;
                frame = 0;
            }
            if (frame !== originFrame) {
                this.sprite.texture = this.frames[frame];
                if (this.fixture) {
                    this.body.destroyFixture(this.fixture);
                }
                let sd = {};
                sd.shape = Circle(Config.bombExplodeRadiusList[frame] * Config.pixel2meter);
                sd.isSensor = true;
                this.fixture = this.body.createFixture(sd);
            }
        } else {
            GameUtils.destroyPhysicalSprite(this);
        }
    }
}

window.BombExplode = BombExplode;
