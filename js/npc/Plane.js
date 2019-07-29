import Config from "../../config";
import {Sprite, Texture} from "../libs/pixi-wrapper";
import {Circle, Vec2} from "../libs/planck-wrapper";
import Utils from "../utils/Utils";
import GameUtils from "../utils/GameUtils";
import MusicMgr from "../mgr/MusicMgr";
import BombExplode from "./BombExplode";
import ElectricSaw from "./ElectricSaw";
import Magnet from "./Magnet";
import Shield from "./Shield";

export default class Plane {
    constructor(world, parent, id, renderPosition) {
        this.world = world;
        this.parent = parent;
        this.config = Config.planeList.find(plane => plane.id === id);
        this.gameScene = App.getScene("GameScene");

        this.sprite = this.parent.addChild(new Sprite());
        this.sprite.anchor.set(...this.config.anchor);
        this.sprite.position.set(renderPosition.x, renderPosition.y);

        this.frames = Config.imagePath[this.config.code].map(path => Texture.from(path));
        this.frameIndex = 0;

        this.body = this.world.createDynamicBody();
        let physicalPosition = GameUtils.renderPos2PhysicsPos(renderPosition);
        this.body.setPosition(physicalPosition);
        this.body.setUserData(this);

        this.setScale(0);

        this.pastPos = [this.body.getPosition()];

        this.invincible = false;

        this.bombCircle = this.sprite.addChild(Sprite.from(Config.imagePath.bombCircle));
        this.bombCircle.anchor.set(0.5, 0.5);
        this.setBombCount(0);

        this.electricSawList = [];

        this.maxShieldCount = 360 / Config.shield.angleInterval;
        this.shieldList = [];

        this.bulletCreateInterval = Config.bullet.createInterval;
        this.bulletCount = 0;

        this.world.registerEvent("begin-contact", this);
        this.world.registerEvent("step", this);
    }

    destroy() {
        if (this.destroyed) {
            return;
        }

        if (this.bombExplode && !this.bombExplode.destroyed) {
            this.bombExplode.destroy();
        }

        this.electricSawList.forEach(es => es.destroy());

        this.shieldList.forEach(shield => shield.destroy());

        if (this.magnet && !this.magnet.destroyed) {
            this.magnet.destroy();
        }

        this.sprite.destroy();

        this.world.destroyBody(this.body);

        this.world.unregisterAllEvent(this);

        this.destroyed = true;
    }

    onBeginContact(contact, anotherFixture, selfFixture) {
        let item = anotherFixture.getBody().getUserData();
        if (item instanceof window.Meteor || item instanceof window.Worm
            || (item instanceof window.Bullet && item.creator !== this)) {
            let userData = selfFixture.getUserData();
            if (userData instanceof Shield) {
                userData.onBeginContact(contact, anotherFixture, selfFixture);
            } else {
                this.contacted = true;
            }
        } else if (item instanceof window.Item && this.isPlaneSelfFixture(selfFixture)) {
            this.atedItem = item.type;
        }
    }

    onStep() {
        this.bombCircle.rotation++;

        if (this.contacted) {
            if (this.bombCount > 0) {
                this.setBombCount(this.bombCount - 1);
                this.bombExplode = new BombExplode(this.world, this.parent, this.sprite.position);
            } else if (!this.invincible) {
                if (this.scale > 0) {
                    this.setScale(this.scale - 1);
                } else {
                    let animationMgr = this.gameScene.animationMgr;
                    animationMgr.createAnimation(Config.imagePath.planeExplode, this.sprite.position, this.sprite.rotation);
                    MusicMgr.playSound(Config.soundPath.planeExplode);
                    this.explodedPosition = {x: this.sprite.x, y: this.sprite.y};
                    this.destroy();
                    this.afterDestroyed();
                    return;
                }
            }
        }

        GameUtils.syncSpriteWithBody(this, this.config.noRotation);

        let pos = this.body.getPosition();
        this.pastPos.push(Vec2(pos.x, pos.y));
        if (this.pastPos.length > Config.planePastPosLength) {
            this.pastPos.shift();
        }

        this.movePlayer();

        if (this.invincible) {
            if (this.invincibleCount <= 0) {
                this.invincible = false;
                this.sprite.alpha = 1;
            } else {
                if (this.invincibleCount % Config.planeInvincibleTwinkleInterval === 0) {
                    if (this.sprite.alpha === 1) {
                        this.sprite.alpha = Config.planeInvincibleAlpha;
                    } else {
                        this.sprite.alpha = 1;
                    }
                }
                this.invincibleCount--;
            }
        }

        GameUtils.destroyWillDestroyedNpc(this.electricSawList);

        this.frameIndex++;
        this.updateFrame();

        this.shieldList.forEach(shield => shield.onStep());
        GameUtils.cleanDestroyedNpc(this.shieldList);

        if (this.magnet) {
            if (this.magnet.destroyed) {
                this.magnet = undefined;
            } else {
                this.magnet.onStep();
            }
        }

        this.contacted = false;

        if (this.confused) {
            this.confusedCountdown--;
            if (this.confusedCountdown === 0) {
                this.confused = false;
                this.sprite.tint = 0xFFFFFF;
                this.startInvincible(Config.confused.endInvincibleFrames);
            }
        }

        this.bulletCount++;
        if (this.bulletCount / Config.fps > this.bulletCreateInterval) {
            this.bulletCount = 0;
            let nearestEnemy = this.gameScene.findNearestEnemy(this);
            if (nearestEnemy) {
                this.shoot(nearestEnemy);
            }
        }

        if (this.atedItem) {
            this.onAteItem(this.atedItem);
            this.atedItem = undefined;
        }
    }

    setTargetAngle(angle) {
        this.targetAngle = angle;
    }

    movePlayer() {
        let angle = this.body.getAngle();
        if (this.targetAngle) {
            let targetAngle = this.confused ?
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

    setScale(scaleLevel) {
        this.scale = scaleLevel;
        let spriteScale = Config.planeScaleList[scaleLevel] / Config.planeBaseScale;
        this.sprite.scale.set(spriteScale, spriteScale);
        this.updateFrame();
        if (this.fixture) {
            this.body.destroyFixture(this.fixture);
        }
        let radius = this.config.planePixelLength * Config.pixel2meter * Config.planeScaleList[scaleLevel] / 2;
        this.fixture = this.body.createFixture(Circle(radius),
            {friction: 0, density: Math.pow(Config.planeScaleList[0] / Config.planeScaleList[scaleLevel], 2)});
        this.gameScene.setLifeCount(scaleLevel + 1);
    }

    updateFrame() {
        let originFrame = Math.floor((this.frameIndex - 1) / Config.frameInterval);
        let frame = Math.floor(this.frameIndex / Config.frameInterval);
        if (originFrame !== frame) {
            if (this.frames[frame] === undefined) {
                this.frameIndex = 0;
                frame = 0;
            }
            this.sprite.texture = this.frames[frame];
            if (this.confused) {
                this.sprite.tint = Math.random() * 0xFFFFFF;
            }
            if (this.magnet) {
                this.magnet.onAnimationFrame();
            }
        }
    }

    startInvincible(invincibleFrame) {
        this.invincible = true;
        this.invincibleCount = invincibleFrame;
    }

    isPlaneSelfFixture(fixture) {
        return fixture === this.fixture;
    }

    onAteItem(type) {
        switch (type) {
            case "Weapon": {
                this.bulletCreateInterval -= Config.weaponItem.reduceBulletCreateInterval;
                if (this.bulletCreateInterval < Config.bullet.minCreateInterval) {
                    this.bulletCreateInterval = Config.bullet.minCreateInterval;
                }
                break;
            }
            case "Func": {
                let type = Utils.randomChoose(Config.randomItemList);
                switch (type) {
                    case "Bomb": {
                        this.setBombCount(this.bombCount + 1);
                        break;
                    }
                    case "Confused": {
                        this.onAteConfused();
                        break;
                    }
                    case "ElectricSaw": {
                        this.createElectricSaw();
                        break;
                    }
                    case "Heart": {
                        this.onAteHeart();
                        break;
                    }
                    case "Magnet": {
                        this.createMagnet();
                        break;
                    }
                    case "Shield": {
                        this.createShield();
                        break;
                    }
                }
            }
        }
    }

    setBombCount(count) {
        this.bombCount = count;
        this.bombCircle.visible = this.bombCount > 0;
    }

    onAteConfused() {
        this.confused = true;
        this.confusedCountdown = Config.confused.countdown;
        this.startInvincible(Config.confused.startInvincibleFrames);
    }

    createElectricSaw() {
        if (this.electricSawList.length < Config.electricSaw.maxCount) {
            this.electricSawList.push(new ElectricSaw(this.world, this.parent, this));
        }
    }

    onAteHeart() {
        if (Config.planeScaleList[this.scale + 1] === undefined) {
            return;
        }
        this.setScale(this.scale + 1);
    }

    createMagnet() {
        if (this.magnet === undefined || this.magnet.destroyed) {
            this.magnet = new Magnet(this.sprite);
        }
    }

    createShield() {
        if (this.shieldList.length < this.maxShieldCount) {
            let radiansList = [];
            for (let i = 0; i < this.maxShieldCount; i++) {
                let radians = i * Utils.angle2radian(Config.shield.angleInterval);
                if (!this.shieldList.some(shield => shield.getRadians() === radians)) {
                    radiansList.push(radians);
                }
            }
            let radians = Utils.randomChoose(radiansList);
            this.shieldList.push(new Shield(this, radians));
        }
    }

    getPastPosition() {
        return this.pastPos[0];
    }

    shoot(nearestEnemy) {
        let radians = Utils.calcRadians(this.body.getPosition(), nearestEnemy.body.getPosition());
        this.gameScene.createBullet(this.body.getPosition(), radians, this);
    }

    afterDestroyed() {
    }

    canExplode() {
        return true;
    }
}

window.Plane = Plane;
