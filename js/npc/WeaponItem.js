import Config from "../../config";
import {Sprite, Texture} from "../libs/pixi-wrapper";
import GameUtils from "../utils/GameUtils";
import {Box} from "../libs/planck-wrapper";

export default class WeaponItem {
    constructor(parent, world, renderPosition) {
        this.parent = parent;
        this.world = world;

        this.textures = Config.imagePath.weaponItem.map(path => Texture.from(path));
        this.textureIndex = 0;
        this.sprite = Sprite.from(this.textures[this.textureIndex]);
        this.parent.addChild(this.sprite);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.position.set(renderPosition.x, renderPosition.y);

        this.body = this.world.createBody();
        this.body.setUserData(this);
        let physicalPosition = GameUtils.renderPos2PhysicsPos(renderPosition);
        this.body.setPosition(physicalPosition);
        let shape = Box(Config.weaponItem.width * Config.pixel2meter / 2,
            Config.weaponItem.height * Config.pixel2meter / 2);
        this.body.createFixture(shape, {isSensor: true});

        this.world.registerEvent("step", this);
        this.world.registerEvent("animation-frame", this);
        this.world.registerEvent("begin-contact", this);
    }

    destroy() {
        this.sprite.destroy();
        this.world.destroyBody(this.body);
        this.world.unregisterAllEvent(this);
    }

    onStep() {
        if (this.ated) {
            this.destroy();
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
        if (another instanceof window.Player && another.isPlayerSelfFixture(anotherFixture)) {
            this.ated = true;
        }
    }
}

window.WeaponItem = WeaponItem;