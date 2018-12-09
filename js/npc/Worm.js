import Config from "../../config";
import {resources, Sprite} from "../libs/pixi-wrapper";
import {Box, Vec2} from "../libs/planck-wrapper";
import GameUtils from "../utils/GameUtils";
import Player from "./Player";
import Meteor from "./Meteor";

export default class Worm {
    constructor(world, container) {
        this.world = world;

        let texture = resources[Config.imagePath.worm].texture;
        let sprite = new Sprite(texture);
        this.sprite = sprite;
        container.addChild(sprite);
        sprite.anchor.set(0.5, 0.5);

        let body = this.world.createDynamicBody();
        this.body = body;
        let width = texture.width * Config.pixel2meter / 2,
            height = texture.height * Config.pixel2meter / 2;
        body.createFixture(Box(width, height), {friction: 0, density: 1});

        let {x, y, radian} = GameUtils.getNpcRandomInitArgs();
        sprite.position.set(x, y);
        sprite.rotation = radian;
        body.setPosition(Vec2(x * Config.pixel2meter, y * Config.pixel2meter));
        body.setAngle(radian);
        body.setUserData(this);

        this.world.registerEvent("begin-contact", this);
        this.world.registerEvent("step", this);
    }

    onBeginContact(contact, anotherFixture,) {
        let item = anotherFixture.getBody().getUserData();
        if (item instanceof Meteor || item instanceof Player) {
            this.exploded = true;
        }
    }

    onStep() {
        if (this.exploded) {
            this.explode();
        } else {
            GameUtils.syncSpriteWithBody(this);

            this.followPlayer();
        }
    }

    onExplode() {
        if (Math.random() < Config.wormDropHeartProbability) {
            let pos = this.body.getPosition();
            App.dispatchEvent("WormDropHeart", Vec2(pos.x, pos.y));
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
}
