import Config from "../../config";
import {resources, Sprite} from "../libs/pixi-wrapper";
import {Box} from "../libs/planck-wrapper";
import GameUtils from "../utils/GameUtils";
import DataMgr from "../mgr/DataMgr";

export default class Coin {
    constructor(world, container, physicalPosition) {
        this.world = world;
        this.container = container;

        this.frames = Config.imagePath.coin.map(path => resources[path].texture);
        this.frameIndex = 0;
        this.sprite = this.container.addChild(new Sprite());
        this.sprite.anchor.set(0.5, 0.5);
        let renderPosition = GameUtils.physicalPos2renderPos(physicalPosition);
        this.sprite.position.set(renderPosition.x, renderPosition.y);

        this.body = world.createBody();
        this.body.setUserData(this);
        let shape = Box(Config.coin.width * Config.pixel2meter / 2, Config.coin.height * Config.pixel2meter / 2);
        this.body.createFixture(shape, {isSensor: true});
        this.body.setPosition(physicalPosition);

        world.registerEvent("begin-contact", this);
        world.registerEvent("step", this);
        world.registerEvent("animation-frame", this);
    }

    onBeginContact(contact, anotherFixture) {
        let another = anotherFixture.getBody().getUserData();
        if (another instanceof window.Plane && another.isPlaneSelfFixture(anotherFixture)) {
            this.ated = true;
        }
    }

    onStep() {
        if (this.ated) {
            this.sprite.destroy();
            this.world.unregisterAllEvent(this);
            this.world.destroyBody(this.body);
            DataMgr.set("coin", DataMgr.get("coin", 0) + 1);
        }
    }

    onAnimationFrame() {
        this.frameIndex++;
        if (this.frames[this.frameIndex] === undefined) {
            this.frameIndex = 0;
        }
        this.sprite.texture = this.frames[this.frameIndex];
    }
}

window.Coin = Coin;
