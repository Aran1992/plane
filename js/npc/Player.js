import Config from "../../config";
import {resources, Sprite} from "../libs/pixi-wrapper";
import {Circle, Vec2} from "../libs/planck-wrapper";
import GameUtils from "../utils/GameUtils";
import Meteor from "./Meteor";
import Worm from "./Worm";
import Component from "../base/Component";
import EventMgr from "../base/EventMgr";
import Wall from "./Wall";
import ElectricSaw from "./ElectricSaw";

export default class Player extends Component {
    constructor(world, container) {
        super();

        this.eventMgr = this.createComponent(EventMgr);
        this.eventMgr.registerEvent("AteHeart", this.onAteHeart.bind(this));
        this.eventMgr.registerEvent("AteItem", this.onAteItem.bind(this));

        this.world = world;
        this.container = container;

        let sprite = new Sprite();
        this.sprite = sprite;
        this.container.addChild(sprite);
        sprite.anchor.set(0.5, 0.5);
        sprite.position.set(Config.gameSceneWidth / 2, Config.gameSceneHeight / 2);

        let body = this.world.createDynamicBody();
        this.body = body;
        body.setPosition(Vec2(Config.gameSceneWidth * Config.pixel2meter / 2, Config.gameSceneHeight * Config.pixel2meter / 2));
        body.setUserData(this);

        this._setScale(0);

        this.pastPos = [body.getPosition()];

        this._scale = 0;

        this._electricSawList = [];
        this._createElectricSaw();

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
        if (this._contacted && this._scale === 0 && !this._invincible) {
            this.explode();
        } else {
            if (this._contacted && this._scale > 0) {
                this._scale--;
                this._setScale(this._scale);
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

            GameUtils.destroyWillDestroyedNpc(this._electricSawList);
        }
        this._contacted = false;
    }

    onExplode() {
        this.destroy();
    }

    destroy() {
        this._electricSawList.forEach(es => es.destroy());
        this._electricSawList = undefined;
        GameUtils.destroyPhysicalSprite(this);
        super.destroy();
    }

    onAteHeart() {
        if (Config.planeScaleList[this._scale + 1] === undefined) {
            return;
        }
        this._scale++;
        this._setScale(this._scale);
    }

    onAteItem() {
        this._createElectricSaw();
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

    _setScale(scale) {
        this.sprite.texture = resources.planeScaleTexture[scale];
        if (this.fixture) {
            this.body.destroyFixture(this.fixture);
        }
        let texture = resources[Config.imagePath.originPlane].texture;
        let radius = texture.width * Config.pixel2meter * Config.planeScaleList[scale] / 2;
        this.fixture = this.body.createFixture(Circle(radius),
            {friction: 0, density: Math.pow(Config.planeScaleList[0] / Config.planeScaleList[scale], 2)});
    }

    _createElectricSaw() {
        this._electricSawList.push(new ElectricSaw(this.world, this.container, this));
    }
}
