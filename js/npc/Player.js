import Config from "../../config";
import {resources, Sprite} from "../libs/pixi-wrapper";
import {Circle, Vec2} from "../libs/planck-wrapper";
import GameUtils from "../utils/GameUtils";
import Component from "../base/Component";
import EventMgr from "../base/EventMgr";
import ElectricSaw from "./ElectricSaw";
import BombExplode from "./BombExplode";
import Shield from "./Shield";
import MusicMgr from "../mgr/MusicMgr";
import Magnet from "./Magnet";

export default class Player extends Component {
    constructor(world, parent, id) {
        super();

        this.gameScene = App.getScene("GameScene");

        this.eventMgr = this.createComponent(EventMgr);
        this.eventMgr.registerEvent("AteItem", this.onAteItem.bind(this));

        this.world = world;
        this.parent = parent;

        this.config = Config.planeList.find(plane => plane.id === id);

        this.sprite = this.parent.addChild(new Sprite());
        this.sprite.anchor.set(...this.config.anchor);
        this.sprite.position.set(Config.gameSceneWidth / 2, Config.gameSceneHeight / 2);

        this.setBombCount(0);
        this.bombCircle = this.sprite.addChild(new Sprite(resources[Config.imagePath.bombCircle].texture));
        this.bombCircle.anchor.set(0.5, 0.5);
        this.bombCircle.visible = false;

        this.frames = Config.imagePath[this.config.code].map(path => resources[path].texture);
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

        this._invincible = false;

        // setTimeout(() => {
        //     this._trailAudio = MusicMgr.playSound(Config.soundPath.trail, true);
        // }, 0);
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
        this.bombCircle.rotation++;
        if (this._contacted && this._scale === 0 && !this._invincible && !this._bombCount) {
            this.explode();
        } else {
            if (this._contacted) {
                if (!this._bombCount && !this._invincible && this._scale > 0) {
                    this._scale--;
                    this._setScale(this._scale);
                }
                if (this._bombCount) {
                    this.setBombCount(this._bombCount - 1);
                    if (this._bombCount === 0) {
                        this.bombCircle.visible = false;
                    }
                    this._bombExplode = new BombExplode(this.world, this.parent, this.sprite.position);
                }
            }

            GameUtils.syncSpriteWithBody(this, this.config.noRotation);

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

            if (this._shield) {
                if (this._shield.destroyed) {
                    this._shield = undefined;
                } else {
                    this._shield.onStep();
                }
            }

            if (this._magnet) {
                if (this._magnet.destroyed) {
                    this._magnet = undefined;
                } else {
                    this._magnet.onStep();
                }
            }
        }

        this._contacted = false;

        if (this._confused) {
            this._confusedCountdown--;
            if (this._confusedCountdown === 0) {
                this._confused = false;
                this.sprite.tint = 0xFFFFFF;
                this._confusedAudio.pause();
                this._confusedAudio = undefined;
                this._startInvincible(Config.confused.endInvincibleFrames);
            }
        }
    }

    onExplode() {
        let animationMgr = this.gameScene.animationMgr;
        animationMgr.createAnimation(Config.imagePath.planeExplode, this.sprite.position, this.sprite.rotation);
        MusicMgr.playSound(Config.soundPath.planeExplode);
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

        if (this._magnet && !this._magnet.destroyed) {
            this._magnet.destroy();
        }
        this._magnet = undefined;

        if (this._confusedAudio) {
            this._confusedAudio.pause();
            this._confusedAudio = undefined;
        }

        // this._trailAudio.pause();
        // this._trailAudio = undefined;

        GameUtils.destroyPhysicalSprite(this);

        super.destroy();
    }

    onAteHeart() {
        if (Config.planeScaleList[this._scale + 1] === undefined) {
            return;
        }
        this._scale++;
        this._setScale(this._scale);
        MusicMgr.playSound(Config.soundPath.pickItem);
    }

    onAteItem(type) {
        switch (type) {
            case "ElectricSaw": {
                this._createElectricSaw();
                break;
            }
            case "Bomb": {
                this.setBombCount(this._bombCount + 1);
                this.bombCircle.visible = true;
                break;
            }
            case "Confused": {
                this._confused = true;
                this._confusedCountdown = Config.confused.countdown;
                this._startInvincible(Config.confused.startInvincibleFrames);
                this._confusedAudio = MusicMgr.playSound(Config.soundPath.confused);
                break;
            }
            case "Shield": {
                this._createShield();
                break;
            }
            case "Magnet": {
                this._createMagnet();
                break;
            }
            case "Heart": {
                this.onAteHeart();
                break;
            }
        }
        MusicMgr.playSound(Config.soundPath.pickItem);
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
            angle = GameUtils.calcStepAngle(angle, targetAngle, this.config.planeAngularVelocity);
        }
        this.body.setAngle(angle);

        GameUtils.fireEngine(this, this.config.planeVelocity, this.config.planeEngineForce);
    }

    isDestroyed() {
        return this.destroyed;
    }

    _setScale(scaleLevel) {
        let spriteScale = Config.planeScaleList[scaleLevel] / Config.planeBaseScale;
        this.sprite.scale.set(spriteScale, spriteScale);
        this._updateFrame();
        if (this.fixture) {
            this.body.destroyFixture(this.fixture);
        }
        let radius = this.config.planePixelLength * Config.pixel2meter * Config.planeScaleList[scaleLevel] / 2;
        this.fixture = this.body.createFixture(Circle(radius),
            {friction: 0, density: Math.pow(Config.planeScaleList[0] / Config.planeScaleList[scaleLevel], 2)});
        this.gameScene.setLifeCount(scaleLevel + 1);
    }

    _createElectricSaw() {
        if (this._electricSawList.length < Config.electricSaw.maxCount) {
            this._electricSawList.push(new ElectricSaw(this.world, this.parent, this));
        }
    }

    _createShield() {
        if (this._shield === undefined || this._shield.destroyed) {
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
            if (this._magnet) {
                this._magnet.onAnimationFrame();
            }
        }
    }

    _startInvincible(invincibleFrame) {
        this._invincible = true;
        this._invincibleCount = invincibleFrame;
    }

    _createMagnet() {
        if (this._magnet === undefined || this._magnet.destroyed) {
            this._magnet = new Magnet(this.sprite);
        }
    }

    setBombCount(count) {
        this._bombCount = count;
        this.gameScene.setBombCount(count);
    }
}

window.Player = Player;
