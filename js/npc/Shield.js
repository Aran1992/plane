import {resources, Sprite} from "../libs/pixi-wrapper";
import Config from "../../config";
import {Box, Vec2} from "../libs/planck-wrapper";

export default class Shield {
    constructor(player) {
        this.player = player;

        let texture = resources[Config.imagePath.shield].texture;
        this.sprite = new Sprite(texture);
        this.sprite.anchor.set(0.5, 0.5);
        player.sprite.parent.addChild(this.sprite);

        let shape = Box(
            texture.width / 2 * Config.pixel2meter,
            texture.height / 2 * Config.pixel2meter,
            Vec2(Config.shield.distance * Config.pixel2meter, 0)
        );
        this.fixture = player.body.createFixture(shape, {density: 0, friction: 0});
        this.fixture.setUserData(this);

        this._updateSprite();

        this._remainCollideTimes = Config.shield.collideTimes;
    }

    onStep() {
        if (this.willDestroyed) {
            this.destroy();
        } else {
            this._updateSprite();
        }
    }

    onBeginContact(contact, anotherFixture) {
        let item = anotherFixture.getBody().getUserData();
        if (item instanceof window.Worm || item instanceof window.Meteor) {
            this._remainCollideTimes--;
            if (this._remainCollideTimes === 0) {
                this.willDestroyed = true;
            }
        }
    }

    _updateSprite() {
        this.sprite.position.set(
            this.player.sprite.x + Math.cos(this.player.sprite.rotation) * Config.shield.distance,
            this.player.sprite.y + Math.sin(this.player.sprite.rotation) * Config.shield.distance,
        );
        this.sprite.rotation = this.player.sprite.rotation;
    }

    destroy() {
        this.player.body.destroyFixture(this.fixture);
        this.fixture = undefined;
        this.sprite.parent.removeChild(this.sprite);
        this.destroyed = true;
    }
}

window.Shield = Shield;
