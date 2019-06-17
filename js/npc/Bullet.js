import Config from "../../config";
import {Circle, Vec2} from "../libs/planck-wrapper";
import {Graphics} from "../libs/pixi-wrapper";
import GameUtils from "../utils/GameUtils";
import Utils from "../utils/Utils";

const GAME_VISIBLE_RECT = {
    x: -Config.designWidth / 2,
    y: -Config.designHeight / 2,
    width: Config.gameSceneWidth + Config.designWidth,
    height: Config.gameSceneHeight + Config.designHeight
};

export default class Bullet {
    constructor(parent, world, position, radius) {
        this.parent = parent;
        this.world = world;

        this.sprite = this.parent.addChild(new Graphics()
            .lineStyle(2, 0xFEEB77, 1)
            .beginFill(Config.bullet.color)
            .drawCircle(0, 0, Config.bullet.radius)
            .endFill());
        let {x, y} = GameUtils.physicalPos2renderPos(position);
        this.sprite.position.set(x, y);

        this.body = this.world.createBody();
        this.body.setUserData(this);
        this.body.setKinematic();
        this.body.createFixture(Circle(Config.bullet.radius * Config.pixel2meter), {isSensor: true});
        this.body.setPosition(position);

        let velocity = Config.bullet.velocity * Config.pixel2meter;
        let vx = Math.cos(radius) * velocity;
        let vy = Math.sin(radius) * velocity;
        this.body.setLinearVelocity(Vec2(vx, vy));

        this.world.registerEvent("begin-contact", this);
        this.world.registerEvent("step", this);
    }

    destroy() {
        this.world.destroyBody(this.body);
        this.sprite.destroy();
        this.world.unregisterAllEvent(this);
    }

    onStep() {
        if (this._exploded) {
            this.destroy();
        } else {
            let {x, y} = GameUtils.physicalPos2renderPos(this.body.getPosition());
            this.sprite.position.set(x, y);
            if (!Utils.isPointInRect({x, y}, GAME_VISIBLE_RECT)) {
                this.destroy();
            }
        }
    }

    onBeginContact(contact, anotherFixture) {
        let item = anotherFixture.getBody().getUserData();
        if (item.canExplode && item.canExplode()) {
            this._exploded = true;
        }
    }
}

window.Bullet = Bullet;
