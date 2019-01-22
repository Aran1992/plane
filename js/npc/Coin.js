import Config from "../../config";
import {Box} from "../libs/planck-wrapper";
import GameUtils from "../utils/GameUtils";
import {resources, Sprite} from "../libs/pixi-wrapper";
import DataMgr from "../mgr/DataMgr";

export default class Coin {
    constructor(world, container, physicalPos) {
        this.world = world;
        this.container = container;

        this.sprite = new Sprite();
        this.container.addChild(this.sprite);
        container.addChild(this.sprite);
        this.sprite.anchor.set(0.5, 0.5);
        let renderPos = GameUtils.physicalPos2renderPos(physicalPos);
        this.sprite.position.set(renderPos.x, renderPos.y);
        this.frames = Config.imagePath.coin.map(path => resources[path].texture);
        this.frameIndex = 0;

        this.body = world.createBody();
        let sd = {};
        sd.shape = Box(Config.coin.width * Config.pixel2meter / 2, Config.coin.height * Config.pixel2meter / 2);
        sd.isSensor = true;
        this.body.createFixture(sd);
        this.body.setPosition(physicalPos);
        this.body.setUserData(this);

        world.registerEvent("begin-contact", this);
        world.registerEvent("step", this);
        world.registerEvent("animation-frame", this);
    }

    onBeginContact(contact, anotherFixture) {
        if (!(anotherFixture.getUserData() instanceof window.Shield)
            && anotherFixture.getBody().getUserData() instanceof window.Player) {
            this.ate = true;
        }
    }

    onStep() {
        if (this.ate) {
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
