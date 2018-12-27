import Config from "../../config";
import {resources, Sprite} from "../libs/pixi-wrapper";
import {Box} from "../libs/planck-wrapper";
import GameUtils from "../utils/GameUtils";
import Utils from "../utils/Utils";

export default class Item {
    constructor(world, container, renderPos) {
        this.world = world;
        this.container = container;

        this.frames = Config.imagePath.item.map(path => resources[path].texture);
        this.frameIndex = 0;
        this.sprite = new Sprite(this.frames[0]);
        this.container.addChild(this.sprite);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.position.set(renderPos.x, renderPos.y);

        this.body = this.world.createBody();
        let sd = {};
        sd.shape = Box(Config.item.width * Config.pixel2meter / 2, Config.item.height * Config.pixel2meter / 2);
        sd.isSensor = true;
        this.body.createFixture(sd);
        let physicalPos = GameUtils.renderPos2PhysicsPos(renderPos);
        this.body.setPosition(physicalPos);
        this.body.setUserData(this);

        this.world.registerEvent("begin-contact", this);
        this.world.registerEvent("step", this);
        this.world.registerEvent("animation-frame", this);
    }

    onBeginContact(contact, anotherFixture) {
        if (!(anotherFixture.getUserData() instanceof window.Shield)
            && anotherFixture.getBody().getUserData() instanceof window.Player) {
            this.ate = true;
        }
    }

    onStep() {
        if (this.ate) {
            GameUtils.destroyPhysicalSprite(this);
            App.dispatchEvent("AteItem", Utils.randomChoose(Config.randomItemList));
        }
    }

    onAnimationFrame() {
        this.frameIndex++;
        if (this.frames[this.frameIndex] === undefined) {
            this.frameIndex = 0;
        }
        this.sprite.texture = this.frames[this.frameIndex];
    }

    destroy() {
        GameUtils.destroyPhysicalSprite(this);
    }
}

window.Item = Item;
