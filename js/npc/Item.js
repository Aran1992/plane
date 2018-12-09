import Config from "../../config";
import {resources, Sprite} from "../libs/pixi-wrapper";
import {Box} from "../libs/planck-wrapper";
import GameUtils from "../utils/GameUtils";

export default class Item {
    constructor(world, container, physicalPos) {
        this.world = world;
        this.container = container;

        let texture = resources[Config.imagePath.item].texture;
        this.sprite = new Sprite(texture);
        this.container.addChild(this.sprite);
        this.sprite.anchor.set(0.5, 0.5);
        let renderPos = GameUtils.physicalPos2renderPos(physicalPos);
        this.sprite.position.set(renderPos.x, renderPos.y);

        this.body = this.world.createBody(texture);
        let sd = {};
        sd.shape = Box(texture.width * Config.pixel2meter / 2, texture.height * Config.pixel2meter / 2);
        sd.isSensor = true;
        this.body.createFixture(sd);
        this.body.setPosition(physicalPos);
        this.body.setUserData(this);

        this.world.registerEvent("begin-contact", this);
        this.world.registerEvent("step", this);
    }

    onBeginContact(contact, anotherFixture) {
        if (anotherFixture.getBody().getUserData() instanceof window.Player) {
            this.ate = true;
        }
    }

    onStep() {
        if (this.ate) {
            GameUtils.destroyPhysicalSprite(this);
            App.dispatchEvent("AteItem");
        }
    }

    destroy() {
        GameUtils.destroyPhysicalSprite(this);
    }
}

window.Item = Item;
