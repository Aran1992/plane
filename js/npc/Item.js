import Config from "../../config";
import {Sprite, Texture} from "../libs/pixi-wrapper";
import {Box} from "../libs/planck-wrapper";
import Utils from "../utils/Utils";
import GameUtils from "../utils/GameUtils";

export default class Item {
    constructor(world, container, renderPosition) {
        this.world = world;
        this.container = container;

        this.textures = Config.imagePath.item.map(path => Texture.from(path));
        this.textureIndex = 0;
        this.sprite = Sprite.from(this.textures[this.textureIndex]);
        this.container.addChild(this.sprite);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.position.set(renderPosition.x, renderPosition.y);

        this.body = this.world.createBody();
        this.body.setUserData(this);
        let physicalPosition = GameUtils.renderPos2PhysicsPos(renderPosition);
        this.body.setPosition(physicalPosition);
        let shape = Box(Config.item.width * Config.pixel2meter / 2, Config.item.height * Config.pixel2meter / 2);
        this.body.createFixture(shape, {isSensor: true});

        this.world.registerEvent("step", this);
        this.world.registerEvent("animation-frame", this);
        this.world.registerEvent("begin-contact", this);
    }

    onBeginContact(contact, anotherFixture) {
        let another = anotherFixture.getBody().getUserData();
        if (another instanceof window.Plane && another.isPlaneSelfFixture(anotherFixture)) {
            this.ated = true;
            this.atePlane = another;
        }
    }

    onStep() {
        if (this.ated) {
            GameUtils.destroyPhysicalSprite(this);
            this.atePlane.onAteItem(Utils.randomChoose(Config.randomItemList));
        } else {
            GameUtils.syncSpriteWithBody(this);
        }
    }

    onAnimationFrame() {
        this.textureIndex++;
        if (this.textureIndex >= this.textures.length) {
            this.textureIndex = 0;
        }
        this.sprite.texture = this.textures[this.textureIndex];
    }

    destroy() {
        this.sprite.destroy();
        this.world.destroyBody(this.body);
        this.world.unregisterAllEvent(this);
    }
}

window.Item = Item;
