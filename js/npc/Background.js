import {resources, Sprite} from "../libs/pixi-wrapper";
import Config from "../../config";

export default class Background {
    constructor(container) {
        let texture = resources[Config.imagePath.bg].texture;
        let bgSprite = new Sprite(texture);
        container.addChild(bgSprite);
        bgSprite.scale.set(Config.gameSceneWidth / texture.width,
            Config.gameSceneHeight / texture.height);
        Config.bgJson.forEach(item => this.createImage(container, item.texture, item.x, item.y));
    }

    createImage(parent, path, x, y) {
        let sprite = new Sprite(resources[path].texture);
        parent.addChild(sprite);
        sprite.position.set(x, y);
    }
}
