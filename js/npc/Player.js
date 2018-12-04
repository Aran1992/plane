import Config from "../../Config";
import {resources, Sprite} from "../libs/pixi-wrapper";
import {Circle, Vec2} from "../libs/planck-wrapper";
import GameUtils from "../utils/GameUtils";
import Meteor from "./Meteor";
import Worm from "./Worm";

export default class Player {
    constructor(world, container) {
        this.world = world;

        let sprite = new Sprite(resources[Config.imagePath.plane].texture);
        this.sprite = sprite;
        container.addChild(sprite);
        sprite.anchor.set(0.5, 0.5);
        sprite.position.set(Config.gameSceneWidth / 2, Config.gameSceneHeight / 2);

        let body = this.world.createDynamicBody();
        this.body = body;
        body.createFixture(Circle(Config.planeRadius), {friction: 0, density: 1});
        body.setPosition(Vec2(Config.gameSceneWidth * Config.pixel2meter / 2,
            Config.gameSceneHeight * Config.pixel2meter / 2));
        body.setUserData(this);

        this.pastPos = [body.getPosition()];

        this.world.registerEvent("begin-contact", this);
        this.world.registerEvent("step", this);
    }

    onBeginContact(contact, anotherFixture,) {
        let item = anotherFixture.getBody().getUserData();
        if (item instanceof Meteor || item instanceof Worm) {
            this.exploded = true;
        }
    }

    onStep() {
        if (this.exploded) {
            this.explode();
        } else {
            GameUtils.syncSpriteWithBody(this);

            let pos = this.body.getPosition();
            this.pastPos.push(Vec2(pos.x, pos.y));
            if (this.pastPos.length > Config.planePastPosLength) {
                this.pastPos.shift();
            }

            this.movePlayer();
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

    setTargetAngle(angle) {
        this.targetAngle = angle;
    }

    movePlayer() {
        let angle = this.body.getAngle();
        if (this.targetAngle) {
            angle = GameUtils.calcStepAngle(angle, this.targetAngle, Config.planeAngularVelocity);
        }
        this.body.setAngle(angle);

        GameUtils.fireEngine(this, Config.planeVelocity, Config.planeEngineForce);
    }

    isDestroyed() {
        return this.destroyed;
    }
}
