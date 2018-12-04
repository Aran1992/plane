import {resources, Sprite} from "../libs/pixi-wrapper";
import Config from "../../Config";

export default class Background {
    constructor(container) {
        let texture = resources[Config.imagePath.bg].texture;
        let sprite = new Sprite(texture);
        container.addChild(sprite);
        sprite.scale.set(Config.gameSceneWidth / texture.width,
            Config.gameSceneHeight / texture.height);
        Config.bgJson.forEach(item => this.createImage(container, item.texture, item.x, item.y));
    }

    createImage(parent, path, x, y) {
        let sprite = new Sprite(resources[path].texture);
        parent.addChild(sprite);
        sprite.position.set(x, y);
    }
}
