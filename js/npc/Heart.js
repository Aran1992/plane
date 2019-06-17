import Config from "../../config";
import {Sprite} from "../libs/pixi-wrapper";
import {Box} from "../libs/planck-wrapper";
import GameUtils from "../utils/GameUtils";

export default class Heart {
    constructor(world, container, physicalPosition) {
        this.world = world;
        this.container = container;

        this.sprite = Sprite.from(Config.imagePath.heart);
        container.addChild(this.sprite);
        this.sprite.anchor.set(0.5, 0.5);
        let renderPosition = GameUtils.physicalPos2renderPos(physicalPosition);
        this.sprite.position.set(renderPosition.x, renderPosition.y);

        this.body = world.createBody();
        this.body.setUserData(this);
        this.body.setPosition(physicalPosition);
        let shape = Box(Config.heart.width * Config.pixel2meter / 2, Config.heart.height * Config.pixel2meter / 2);
        this.body.createFixture(shape, {isSensor: true});

        world.registerEvent("begin-contact", this);
        world.registerEvent("step", this);
    }

    onBeginContact(contact, anotherFixture) {
        let another = anotherFixture.getBody().getUserData();
        if (another instanceof window.Plane && another.isPlaneSelfFixture(anotherFixture)) {
            this.ated = true;
            this.atePlane = anotherFixture.getBody().getUserData();
        }
    }

    onStep() {
        if (this.ated) {
            this.atePlane.onAteItem("Heart");
            GameUtils.destroyPhysicalSprite(this);
        } else {
            GameUtils.syncSpriteWithBody(this);
        }
    }

    isDestroyed() {
        return this.destroyed;
    }
}

window.Heart = Heart;
