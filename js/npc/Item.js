import Config from "../../config";
import {Sprite, Texture} from "../libs/pixi-wrapper";
import {Box} from "../libs/planck-wrapper";
import GameUtils from "../utils/GameUtils";

export default class Item {
    constructor(mgr, parent, world, type, imagePathList, config, renderPosition) {
        this.mgr = mgr;
        this.parent = parent;
        this.world = world;
        this.type = type;

        this.textures = imagePathList.map(path => Texture.from(path));
        this.textureIndex = 0;
        this.sprite = Sprite.from(this.textures[this.textureIndex]);
        this.parent.addChild(this.sprite);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.position.set(renderPosition.x, renderPosition.y);

        this.body = this.world.createBody();
        this.body.setUserData(this);
        let physicalPosition = GameUtils.renderPos2PhysicsPos(renderPosition);
        this.body.setPosition(physicalPosition);
        let shape = Box(config.width * Config.pixel2meter / 2, config.height * Config.pixel2meter / 2);
        this.body.createFixture(shape, {isSensor: true});

        this.world.registerEvent("step", this);
        this.world.registerEvent("animation-frame", this);
        this.world.registerEvent("begin-contact", this);
    }

    destroy() {
        this.mgr.removeChild(this);
        this.sprite.destroy();
        this.world.destroyBody(this.body);
        this.world.unregisterAllEvent(this);
    }

    onStep() {
        if (this.ated) {
            this.destroy();
            this.mgr.onAteItem();
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

    onBeginContact(contact, anotherFixture) {
        let another = anotherFixture.getBody().getUserData();
        if (another instanceof window.Plane && another.isPlaneSelfFixture(anotherFixture)) {
            this.ated = true;
        }
    }
}

window.Item = Item;
