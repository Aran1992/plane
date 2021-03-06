import {resources, Sprite} from "../libs/pixi-wrapper";
import Config from "../../config";
import {Circle, RevoluteJoint} from "../libs/planck-wrapper";
import GameUtils from "../utils/GameUtils";
// import MusicMgr from "../mgr/MusicMgr";

export default class ElectricSaw {
    constructor(world, container, player) {
        this.world = world;
        this.container = container;

        let texture = resources[Config.imagePath.electricSaw].texture;
        let renderPos = {x: player.sprite.x - Config.electricSaw.distance, y: player.sprite.y};
        this.sprite = new Sprite(texture);
        this.container.addChild(this.sprite);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.position.set(renderPos.x, renderPos.y);

        this.body = this.world.createDynamicBody();
        let esBodyRadius = Config.electricSaw.radius * Config.pixel2meter;
        this.body.createFixture(Circle(esBodyRadius), {friction: 0, density: Config.electricSaw.density});
        this.body.setPosition(GameUtils.renderPos2PhysicsPos(renderPos));
        this.body.setUserData(this);

        this.world.createJoint(RevoluteJoint({collideConnected: false}, this.body, player.body, player.body.getPosition()));

        this.world.registerEvent("begin-contact", this);
        this.world.registerEvent("step", this);

        this.remainCollideTimes = Config.electricSaw.collideTimes;

        // this.audio = MusicMgr.playSound(Config.soundPath.esRotate, true);
    }

    onBeginContact(contact, anotherFixture) {
        let item = anotherFixture.getBody().getUserData();
        if ((item instanceof window.Worm) || (item instanceof window.Meteor)) {
            this.remainCollideTimes--;
            if (this.remainCollideTimes <= 0) {
                this.willDestroyed = true;
            }
        }
    }

    onStep() {
        let rotation = this.sprite.rotation;
        GameUtils.syncSpriteWithBody(this);
        this.sprite.rotation = rotation + Config.electricSaw.angularVelocity;
    }

    destroy() {
        // this.audio.pause();
        GameUtils.destroyPhysicalSprite(this);
    }
}

window.ElectricSaw = ElectricSaw;
