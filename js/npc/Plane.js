import Config from "../../config";
import {Container, Sprite, Texture} from "../libs/pixi-wrapper";
import {Circle, Vec2} from "../libs/planck-wrapper";
import Utils from "../utils/Utils";
import GameUtils from "../utils/GameUtils";
import MusicMgr from "../mgr/MusicMgr";
import BombExplode from "./BombExplode";
import ElectricSaw from "./ElectricSaw";
import Magnet from "./Magnet";
import Shield from "./Shield";
import Weapon from "./Weapon/Weapon";

export default class Plane {
    constructor(world, parent, id, renderPosition) {
        this.world = world;
        this.parent = parent;
        this.config = Config.planeList.find(plane => plane.id === id);
        this.gameScene = App.getScene("GameScene");

        this.sprite = this.parent.addChild(new Container());
        this.sprite.position.set(renderPosition.x, renderPosition.y);
        this.planeSprite = this.sprite.addChild(new Sprite());
        this.planeSprite.anchor.set(...this.config.anchor);

        this.frames = Config.imagePath[this.config.code].map(path => Texture.from(path));
        this.frameIndex = 0;

        this.createLifePanel();

        this.body = this.world.createDynamicBody();
        let physicalPosition = GameUtils.renderPos2PhysicsPos(renderPosition);
        this.body.setPosition(physicalPosition);
        this.body.setUserData(this);

        this.setScale(this.config.heartCount - 1);

        this.pastPos = [this.body.getPosition()];

        this.invincible = false;

        this.bombCircle = this.planeSprite.addChild(Sprite.from(Config.imagePath.bombCircle));
        this.bombCircle.anchor.set(0.5, 0.5);
        this.setBombCount(0);

        this.electricSawList = [];

        this.maxShieldCount = 360 / Config.shield.angleInterval;
        this.shieldList = [];

        this.weaponTable = {
            basic: new Weapon(Config.weapon.basic, Config.bullet.basic, this)
        };

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

        for (let name in this.weaponTable) {
            if (this.weaponTable.hasOwnProperty(name)) {
                this.weaponTable[name].destroy();
            }
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
        if (this.atedItem) {
            this.onAteItem(this.atedItem);
            this.atedItem = undefined;
        }

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
                    animationMgr.createAnimation(Config.imagePath.planeExplode, this.sprite.position, this.planeSprite.rotation);
                    MusicMgr.playSound(Config.soundPath.planeExplode);
                    this.explodedPosition = {x: this.sprite.x, y: this.sprite.y};
                    this.destroy();
                    this.afterDestroyed();
                    return;
                }
            }
        }

        this.syncSpriteWithBody();

        let pos = this.body.getPosition();
        this.pastPos.push(Vec2(pos.x, pos.y));
        if (this.pastPos.length > Config.planePastPosLength) {
            this.pastPos.shift();
        }

        this.movePlayer();

        if (this.invincible) {
            if (this.invincibleCount <= 0) {
                this.invincible = false;
                this.planeSprite.alpha = 1;
            } else {
                if (this.invincibleCount % Config.planeInvincibleTwinkleInterval === 0) {
                    if (this.planeSprite.alpha === 1) {
                        this.planeSprite.alpha = Config.planeInvincibleAlpha;
                    } else {
                        this.planeSprite.alpha = 1;
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
                this.planeSprite.tint = 0xFFFFFF;
                this.startInvincible(Config.confused.endInvincibleFrames);
            }
        }

        for (let type in this.weaponTable) {
            if (this.weaponTable.hasOwnProperty(type)) {
                this.weaponTable[type].update();
            }
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
        if (scaleLevel === this.scale) {
            return;
        }
        if (Config.planeScaleList[scaleLevel] === undefined) {
            scaleLevel = Utils.getLast(Config.planeScaleList);
        }
        this.scale = scaleLevel;
        let spriteScale = Config.planeScaleList[scaleLevel] / Config.planeBaseScale;
        this.planeSprite.scale.set(spriteScale, spriteScale);
        this.updateFrame();
        if (this.fixture) {
            this.body.destroyFixture(this.fixture);
        }
        let radius = this.config.planePixelLength * Config.pixel2meter * Config.planeScaleList[scaleLevel] / 2;
        this.fixture = this.body.createFixture(Circle(radius),
            {friction: 0, density: Math.pow(Config.planeScaleList[0] / Config.planeScaleList[scaleLevel], 2)});
        this.setLifeCount(this.scale + 1);
    }

    updateFrame() {
        let originFrame = Math.floor((this.frameIndex - 1) / Config.frameInterval);
        let frame = Math.floor(this.frameIndex / Config.frameInterval);
        if (originFrame !== frame) {
            if (this.frames[frame] === undefined) {
                this.frameIndex = 0;
                frame = 0;
            }
            this.planeSprite.texture = this.frames[frame];
            if (this.confused) {
                this.planeSprite.tint = Math.random() * 0xFFFFFF;
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
            case "Heart": {
                this.onAteHeart();
                break;
            }
            case "Weapon": {
                let type = Utils.randomChoose(Utils.keys(Config.weapon));
                if (this.weaponTable[type] === undefined) {
                    this.weaponTable[type] = new Weapon(Config.weapon[type], Config.bullet[type], this);
                } else {
                    this.weaponTable[type].addSupply();
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
            this.magnet = new Magnet(this.planeSprite);
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

    shootNearestEnemy(bulletConfig, bulletVelocity) {
        let nearestEnemy = this.gameScene.findNearestEnemy(this);
        if (nearestEnemy) {
            this.shoot(nearestEnemy, bulletConfig, bulletVelocity);
        }
    }

    shoot(nearestEnemy, bulletConfig, bulletVelocity) {
        const baseRadian = Utils.calcRadians(this.body.getPosition(), nearestEnemy.body.getPosition());
        const offset = (bulletConfig.bulletCountEachShoot - 1) / 2;
        const includeAngle = Utils.angle2radian(bulletConfig.includedAngle);
        for (let i = 0; i < bulletConfig.bulletCountEachShoot; i++) {
            const radians = (i - offset) * includeAngle;
            this.gameScene.createBullet(bulletConfig, bulletVelocity, this.body.getPosition(), baseRadian + radians, this);
        }
    }

    afterDestroyed() {
    }

    canExplode() {
        return true;
    }

    createLifePanel() {
        this.lifePanel = this.sprite.addChild(new Container());
        this.lifePanel.y = Config.plane.lifePanel.y;
    }

    setLifeCount() {
        this.lifePanel.removeChildren();
        for (let i = 0; i <= this.scale; i++) {
            let icon = this.lifePanel.addChild(Sprite.from(Config.imagePath.heart));
            icon.anchor.set(0.5, 0.5);
            icon.x = i * Config.plane.lifePanel.heartOffset;
        }
        this.lifePanel.x = -this.scale * Config.plane.lifePanel.heartOffset / 2;
    }

    syncSpriteWithBody() {
        let pos = this.body.getPosition();
        this.sprite.position.set(pos.x * Config.meter2pixel, pos.y * Config.meter2pixel);
        if (!this.config.noRotation) {
            this.planeSprite.rotation = this.body.getAngle();
        }
    }
}

window.Plane = Plane;
