import Config from "../../config";
import {resources, Sprite} from "../libs/pixi-wrapper";
import {Circle, Vec2} from "../libs/planck-wrapper";
import GameUtils from "../utils/GameUtils";
import Component from "../base/Component";
import EventMgr from "../base/EventMgr";
import ElectricSaw from "./ElectricSaw";
import BombExplode from "./BombExplode";
import Shield from "./Shield";

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
        sprite.anchor.set(0.6, 0.5);
        sprite.position.set(Config.gameSceneWidth / 2, Config.gameSceneHeight / 2);

        this.frames = resources.planeScaleTexture[0];
        this.frameIndex = 0;

        let body = this.world.createDynamicBody();
        this.body = body;
        body.setPosition(Vec2(Config.gameSceneWidth * Config.pixel2meter / 2, Config.gameSceneHeight * Config.pixel2meter / 2));
        body.setUserData(this);

        this._setScale(0);

        this.pastPos = [body.getPosition()];

        this._scale = 0;

        this._electricSawList = [];

        this.world.registerEvent("pre-solve", this);
        this.world.registerEvent("begin-contact", this);
        this.world.registerEvent("step", this);
    }

    onPreSolve(contact, anotherFixture) {
        if (this._invincible
            && !(anotherFixture.getBody().getUserData() instanceof window.Wall)) {
            contact.setEnabled(false);
        }
    }

    onBeginContact(contact, anotherFixture, selfFixture) {
        let item = anotherFixture.getBody().getUserData();
        if (item instanceof window.Meteor || item instanceof window.Worm) {
            if (selfFixture.getUserData() instanceof Shield) {
                this._shield.onBeginContact(contact, anotherFixture, selfFixture);
            } else {
                this._contacted = true;
            }
        }
    }

    onStep() {
        if (this._contacted && this._scale === 0 && !this._invincible && !this._takenBomb) {
            this.explode();
        } else {
            if (this._contacted) {
                if (this._scale > 0) {
                    this._scale--;
                    this._setScale(this._scale);
                }
                if (this._takenBomb) {
                    this._takenBomb = false;
                    this._bombExplode = new BombExplode(this.world, this.container, this.sprite.position);
                }
            }

            GameUtils.syncSpriteWithBody(this);

            let pos = this.body.getPosition();
            this.pastPos.push(Vec2(pos.x, pos.y));
            if (this.pastPos.length > Config.planePastPosLength) {
                this.pastPos.shift();
            }

            this.movePlayer();

            if (this._invincible) {
                if (this._invincibleCount <= 0) {
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
                    this._invincibleCount--;
                }
            }

            GameUtils.destroyWillDestroyedNpc(this._electricSawList);

            this.frameIndex++;
            this._updateFrame();

            if (this._shield && !this._shield.destroyed) {
                this._shield.onStep();
            }
        }

        this._contacted = false;

        if (this._confused) {
            this._confusedCountdown--;
            if (this._confusedCountdown === 0) {
                this._confused = false;
                this.sprite.tint = 0xFFFFFF;
                this._startInvincible(Config.confused.endInvincibleFrames);
            }
        }
    }

    onExplode() {
        this.destroy();
    }

    destroy() {
        this._electricSawList.forEach(es => es.destroy());
        this._electricSawList = undefined;

        if (this._bombExplode && !this._bombExplode.destroyed) {
            this._bombExplode.destroy();
        }
        this._bombExplode = undefined;

        if (this._shield && !this._shield.destroyed) {
            this._shield.destroy();
        }
        this._shield = undefined;

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

    onAteItem(type) {
        switch (type) {
            case "ElectricSaw": {
                this._createElectricSaw();
                break;
            }
            case "Bomb": {
                this._takenBomb = true;
                break;
            }
            case "Confused": {
                this._confused = true;
                this._confusedCountdown = Config.confused.countdown;
                this._startInvincible(Config.confused.startInvincibleFrames);
                break;
            }
            case "Shield": {
                this._createShield();
                break;
            }
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
            let targetAngle = this._confused ?
                (this.targetAngle >= Math.PI ?
                    this.targetAngle - Math.PI :
                    this.targetAngle + Math.PI) :
                this.targetAngle;
            angle = GameUtils.calcStepAngle(angle, targetAngle, Config.planeAngularVelocity);
        }
        this.body.setAngle(angle);

        GameUtils.fireEngine(this, Config.planeVelocity, Config.planeEngineForce);
    }

    isDestroyed() {
        return this.destroyed;
    }

    _setScale(scale) {
        this.frames = resources.planeScaleTexture[scale];
        this._updateFrame();
        if (this.fixture) {
            this.body.destroyFixture(this.fixture);
        }
        let radius = Config.planePixelLength * Config.pixel2meter * Config.planeScaleList[scale] / 2;
        this.fixture = this.body.createFixture(Circle(radius),
            {friction: 0, density: Math.pow(Config.planeScaleList[0] / Config.planeScaleList[scale], 2)});
    }

    _createElectricSaw() {
        if (this._electricSawList.length < Config.electricSaw.maxCount) {
            this._electricSawList.push(new ElectricSaw(this.world, this.container, this));
        }
    }

    _createShield() {
        if (this._shield === undefined) {
            this._shield = new Shield(this);
        }
    }

    _updateFrame() {
        let originFrame = Math.floor((this.frameIndex - 1) / Config.frameInterval);
        let frame = Math.floor(this.frameIndex / Config.frameInterval);
        if (originFrame !== frame) {
            if (this.frames[frame] === undefined) {
                this.frameIndex = 0;
                frame = 0;
            }
            this.sprite.texture = this.frames[frame];
            if (this._confused) {
                this.sprite.tint = Math.random() * 0xFFFFFF;
            }
        }
    }

    _startInvincible(invincibleFrame) {
        this._invincible = true;
        this._invincibleCount = invincibleFrame;
    }
}

window.Player = Player;