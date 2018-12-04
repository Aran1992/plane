import Config from "../../Config";
import {resources, Sprite} from "../libs/pixi-wrapper";
import {Circle, Vec2} from "../libs/planck-wrapper";
import GameUtils from "../utils/GameUtils";
import Worm from "./Worm";
import Player from "./Player";

export default class Meteor {
    constructor(world, container) {
        this.world = world;

        let sprite = new Sprite(resources[Config.imagePath.meteor].texture);
        this.sprite = sprite;
        container.addChild(sprite);
        sprite.anchor.set(0.5, 0.5);

        let body = this.world.createDynamicBody();
        this.body = body;
        body.createFixture(Circle(Config.meteorRadius), {
            friction: 0,
            density: 1,
            restitution: Config.meteorRestitution
        });
        body.setUserData(this);

        let {x, y, radian, velocity} = GameUtils.getNpcRandomInitArgs(Config.meteorRadius * Config.meter2pixel);
        sprite.position.set(x, y);
        sprite.rotation = radian;
        body.setPosition(Vec2(x * Config.pixel2meter, y * Config.pixel2meter));
        body.setAngle(radian);

        body.setLinearVelocity(Vec2(velocity * Math.cos(radian), velocity * Math.sin(radian)));
        body.setAngularVelocity(Config.meteorAngularVelocity);

        this.world.registerEvent("pre-solve", this);
        this.world.registerEvent("begin-contact", this);
        this.world.registerEvent("step", this);
    }

    onPreSolve(contact, anotherFixture) {
        let item = anotherFixture.getBody().getUserData();
        if (item instanceof Meteor) {
            contact.setEnabled(false);
        }
    }

    onBeginContact(contact, anotherFixture,) {
        let item = anotherFixture.getBody().getUserData();
        if (item instanceof Worm || item instanceof Player) {
            this.exploded = true;
        }
    }

    onStep() {
        if (this.exploded) {
            this.explode();
        } else {
            GameUtils.syncSpriteWithBody(this);
        }
    }

    onExplode() {
        this.destroy();
    }

    onDestroy() {
        GameUtils.destroyPhysicalSprite(this);
    }

    explode() {
        this.onExplode();
    }

    destroy() {
        this.onDestroy();
    }

    isDestroyed() {
        return this.destroyed;
    }
}
