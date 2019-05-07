import Config from "../../config";
import {resources, Sprite} from "../libs/pixi-wrapper";
import {Box, Vec2} from "../libs/planck-wrapper";
import GameUtils from "../utils/GameUtils";
import MusicMgr from "../mgr/MusicMgr";

export default class Worm {
    constructor(world, container) {
        this.world = world;

        this.frames = Config.imagePath.worm.map(path => resources[path].texture);
        this.frameIndex = 0;
        let texture = this.frames[0];
        let sprite = new Sprite(texture);
        this.sprite = sprite;
        container.addChild(sprite);
        sprite.anchor.set(0.5, 0.5);

        let body = this.world.createDynamicBody();
        this.body = body;
        let width = Config.worm.width * Config.pixel2meter / 2,
            height = Config.worm.height * Config.pixel2meter / 2;
        body.createFixture(Box(width, height), {friction: 0, density: 1});

        let {x, y, radian} = GameUtils.getNpcRandomInitArgs();
        sprite.position.set(x, y);
        sprite.rotation = radian;
        body.setPosition(Vec2(x * Config.pixel2meter, y * Config.pixel2meter));
        body.setAngle(radian);
        body.setUserData(this);

        this.world.registerEvent("begin-contact", this);
        this.world.registerEvent("step", this);

        this.blood = Config.worm.blood;
    }

    onBeginContact(contact, anotherFixture,) {
        let item = anotherFixture.getBody().getUserData();
        if (item instanceof window.Meteor
            || item instanceof window.Player
            || item instanceof window.BombExplode
            || item instanceof window.ElectricSaw) {
            this.exploded = true;
            if (item instanceof window.Player && !(anotherFixture.getUserData() instanceof window.Shield)) {
                this._contactedPlayerSelf = true;
            }
        }
        if (item instanceof window.Bullet) {
            this.blood -= Config.bullet.damage;
            if (this.blood <= 0) {
                this.exploded = true;
            }
        }
    }

    onStep() {
        if (this.exploded) {
            this.explode();
        } else {
            GameUtils.syncSpriteWithBody(this);
            this.frameIndex++;
            let frame = Math.floor(this.frameIndex / Config.frameInterval);
            if (this.frames[frame] === undefined) {
                this.frameIndex = 0;
                frame = 0;
            }
            this.sprite.texture = this.frames[frame];

            this.followPlayer();
        }
    }

    onExplode() {
        if (Math.random() < Config.wormDropHeartProbability && !this._contactedPlayerSelf) {
            let pos = this.body.getPosition();
            App.dispatchEvent("WormDropHeart", Vec2(pos.x, pos.y));
        }
        let gameScene = App.getScene("GameScene");
        gameScene.animationMgr.createAnimation(Config.imagePath.meteorExplode, this.sprite.position, this.sprite.rotation + Math.PI);
        if (gameScene.isPointInView(this.sprite.position)) {
            MusicMgr.playSound(Config.soundPath.enemyExplode);
        }
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

    followPlayer() {
        //todo 暂时先不写游戏管理器 直接从scene里面获取
        let player = App.getScene("GameScene").plane;
        if (!player.isDestroyed()) {
            let pp = player.pastPos[0];
            let wp = this.body.getPosition();
            let targetAngle = GameUtils.calcVectorAngle(pp.x - wp.x, pp.y - wp.y);
            let angle = GameUtils.calcStepAngle(this.body.getAngle(), targetAngle, Config.wormAngularVelocity);
            this.body.setAngle(angle);
            GameUtils.fireEngine(this, Config.wormVelocity, Config.wormEngineForce);
        }
    }

    isDestroyed() {
        return this.destroyed;
    }

    canExplode() {
        return true;
    }
}

window.Worm = Worm;
