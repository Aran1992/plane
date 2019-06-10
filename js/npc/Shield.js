import {resources, Sprite} from "../libs/pixi-wrapper";
import Config from "../../config";
import {Box, Vec2} from "../libs/planck-wrapper";

export default class Shield {
    constructor(player, radians) {
        this.player = player;
        this._selfRadians = radians;

        let texture = resources[Config.imagePath.shield].texture;
        this.sprite = new Sprite(texture);
        this.sprite.anchor.set(0.5, 0.5);
        player.sprite.parent.addChild(this.sprite);

        let distance = Config.shield.distance * Config.pixel2meter;
        let x = distance * Math.cos(this._selfRadians);
        let y = distance * Math.sin(this._selfRadians);
        let shape = Box(
            Config.shield.width / 2 * Config.pixel2meter,
            Config.shield.height / 2 * Config.pixel2meter,
            Vec2(x, y)
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
        let rotation = this.player.body.getAngle() + this._selfRadians;
        this.sprite.position.set(
            this.player.sprite.x + Math.cos(rotation) * Config.shield.distance,
            this.player.sprite.y + Math.sin(rotation) * Config.shield.distance,
        );
        this.sprite.rotation = rotation;
    }

    destroy() {
        this.player.body.destroyFixture(this.fixture);
        this.fixture = undefined;
        this.sprite.parent.removeChild(this.sprite);
        this.destroyed = true;
    }

    isDestroyed() {
        return this.destroyed;
    }

    getRadians() {
        return this._selfRadians;
    }
}

window.Shield = Shield;
