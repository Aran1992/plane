import Config from "../../config";
import {resources, Sprite} from "../libs/pixi-wrapper";
import {Box} from "../libs/planck-wrapper";
import GameUtils from "../utils/GameUtils";
import Utils from "../utils/Utils";

export default class Item {
    constructor(world, container) {
        this.world = world;
        this.container = container;

        let renderPos = {
            x: Utils.randomInRange(Config.refreshItemOffset, Config.gameSceneWidth - Config.refreshItemOffset),
            y: Utils.randomInRange(Config.refreshItemOffset, Config.gameSceneHeight - Config.refreshItemOffset)
        };

        let texture = resources[Config.imagePath.item].texture;
        this.sprite = new Sprite(texture);
        this.container.addChild(this.sprite);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.position.set(renderPos.x, renderPos.y);

        this.body = this.world.createBody(texture);
        let sd = {};
        sd.shape = Box(texture.width * Config.pixel2meter / 2, texture.height * Config.pixel2meter / 2);
        sd.isSensor = true;
        this.body.createFixture(sd);
        let physicalPos = GameUtils.renderPos2PhysicsPos(renderPos);
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
            App.dispatchEvent("AteItem", Utils.randomChoose(["ElectricSaw", "Bomb", "Confused"]));
        }
    }

    destroy() {
        GameUtils.destroyPhysicalSprite(this);
    }
}

window.Item = Item;
