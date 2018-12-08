import Config from "../../config";
import {resources, Sprite} from "../libs/pixi-wrapper";
import {Circle, Vec2} from "../libs/planck-wrapper";
import GameUtils from "../utils/GameUtils";
import Meteor from "./Meteor";
import Worm from "./Worm";
import Component from "../base/Component";
import EventMgr from "../base/EventMgr";
import Wall from "./Wall";

export default class Player extends Component {
    constructor(world, container) {
        super();

        this.eventMgr = this.createComponent(EventMgr);
        this.eventMgr.registerEvent("AteHeart", this.onAteHeart.bind(this));

        this.world = world;

        let sprite = new Sprite(resources[Config.imagePath.plane].texture);
        this.sprite = sprite;
        container.addChild(sprite);
        sprite.anchor.set(0.5, 0.5);
        sprite.position.set(Config.gameSceneWidth / 2, Config.gameSceneHeight / 2);

        let body = this.world.createDynamicBody();
        this.body = body;
        this.fixture = body.createFixture(Circle(Config.planeRadius), {friction: 0, density: 1});
        body.setPosition(Vec2(Config.gameSceneWidth * Config.pixel2meter / 2,
            Config.gameSceneHeight * Config.pixel2meter / 2));
        body.setUserData(this);

        this.pastPos = [body.getPosition()];

        this.ateHeartCount = 0;

        this.world.registerEvent("pre-solve", this);
        this.world.registerEvent("begin-contact", this);
        this.world.registerEvent("step", this);
    }

    onPreSolve(contact, anotherFixture) {
        if (this._invincible
            && !(anotherFixture.getBody().getUserData() instanceof Wall)) {
            contact.setEnabled(false);
        }
    }

    onBeginContact(contact, anotherFixture) {
        let item = anotherFixture.getBody().getUserData();
        if (item instanceof Meteor || item instanceof Worm) {
            this._contacted = true;
        }
    }

    onStep() {
        if (this._contacted && !this._isBig && !this._invincible) {
            this.explode();
        } else {
            if (this._contacted && this._isBig) {
                this._isBig = false;
                this._invincible = true;
                this._invincibleCount = 0;
                this.sprite.texture = resources[Config.imagePath.plane].texture;
                this.body.destroyFixture(this.fixture);
                this.fixture = this.body.createFixture(Circle(Config.planeRadius), {friction: 0, density: 1});
            }

            GameUtils.syncSpriteWithBody(this);

            let pos = this.body.getPosition();
            this.pastPos.push(Vec2(pos.x, pos.y));
            if (this.pastPos.length > Config.planePastPosLength) {
                this.pastPos.shift();
            }

            this.movePlayer();

            if (this._invincible) {
                if (this._invincibleCount >= Config.planeInvincibleFrame) {
                    this._invincible = false;
                    this.sprite.alpha = 1;
                } else {
                    if (this._invincibleCount % Config.planeInvincibleTwinkleInterval === 0) {
                        if (this.sprite.alpha === 1) {
                            this.sprite.alpha = Config.planeInvincibleAlpha;
                        } else {
                            this.sprite.alpha = 1;
                        }
                    }
                    this._invincibleCount++;
                }
            }
        }
        this._contacted = false;
    }

    onExplode() {
        this.destroy();
    }

    destroy() {
        GameUtils.destroyPhysicalSprite(this);
        super.destroy();
    }

    onAteHeart() {
        if (this._isBig) {
            return;
        }
        this.ateHeartCount++;
        if (this.ateHeartCount >= 1) {
            this.ateHeartCount = 0;
            this._isBig = true;
            this.sprite.texture = resources[Config.imagePath.bigPlane].texture;
            this.body.destroyFixture(this.fixture);
            this.fixture = this.body.createFixture(Circle(Config.planeRadius * Config.bigPlaneMultiples), {
                friction: 0,
                density: 0.5 / Config.bigPlaneMultiples
            });
        }
    }

    explode() {
        this.onExplode();
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
