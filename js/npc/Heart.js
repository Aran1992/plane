import {resources, Sprite} from "../libs/pixi-wrapper";
import Config from "../../config";
import {Box} from "../libs/planck-wrapper";
import GameUtils from "../utils/GameUtils";

export default class Heart {
    constructor(world, container, wormPos) {
        this.world = world;

        let texture = resources[Config.imagePath.heart].texture;
        this.sprite = new Sprite(texture);
        container.addChild(this.sprite);
        let rp = GameUtils.physicalPos2renderPos(wormPos);
        this.sprite.position.set(rp.x, rp.y);

        this.body = world.createBody();
        let sd = {};
        sd.shape = Box(texture.width * Config.pixel2meter / 2, texture.height * Config.pixel2meter / 2);
        sd.isSensor = true;
        this.body.createFixture(sd);
        this.body.setPosition(wormPos);
        this.body.setUserData(this);

        world.registerEvent("begin-contact", this);
        world.registerEvent("step", this);
    }

    onBeginContact(contact, anotherFixture) {
        if (anotherFixture.getBody().getUserData() instanceof window.Player) {
            this.ate = true;
        }
    }

    onStep() {
        if (this.ate) {
            GameUtils.destroyPhysicalSprite(this);
            App.dispatchEvent("AteHeart");
        }
    }

    isDestroyed() {
        return this.destroyed;
    }
}

window.Heart = Heart;
