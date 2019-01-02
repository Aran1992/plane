import {resources, Sprite} from "../libs/pixi-wrapper";
import Config from "../../config";
import Utils from "../utils/Utils";

export default class Background {
    constructor(world, container) {
        this.world = world;
        this.container = container;

        let texture = resources[Config.imagePath.bg].texture;
        let bgSprite = new Sprite(texture);
        this.container.addChild(bgSprite);
        bgSprite.scale.set(Config.gameSceneWidth / texture.width,
            Config.gameSceneHeight / texture.height);

        let starList = [];
        for (let i = 0; i < Config.star.count; i++) {
            let x = Utils.randomInRange(0, Config.gameSceneWidth);
            let y = Utils.randomInRange(0, Config.gameSceneHeight);
            while (starList.some(item => item.x === x && item.y === y)) {
                x += 10;
                y += 10;
            }
            let star = this.createImage(Config.imagePath.star, x, y, 0.5, 0.5);
            star.alpha = Math.random();
            starList.push(star);
        }
        this.starList = starList;

        this.cloudList = [];

        Config.bgJson.forEach(item => {
            let sprite = this.createImage(item.texture, item.x, item.y);
            if (item.texture.indexOf("cloud") !== -1) {
                sprite.velocity = Utils.randomInRange(Config.cloud.minSpeed, Config.cloud.maxSpeed);
                this.cloudList.push(sprite);
            }
        });

        this.world.registerEvent("animation-frame", this);
        this.world.registerEvent("step", this);
    }

    createImage(path, x, y, anchorX, anchorY) {
        let sprite = new Sprite(resources[path].texture);
        this.container.addChild(sprite);
        sprite.anchor.set(anchorX || 0, anchorY || 0);
        sprite.position.set(x, y);
        return sprite;
    }

    onAnimationFrame() {
        this.starList.forEach(star => {
            if (star.alpha >= 1) {
                star.add = false;
            } else if (star.alpha <= 0) {
                star.add = true;
            }
            star.alpha += star.add ? 0.1 : -0.1;
        });
    }

    onStep() {
        this.cloudList.forEach(cloud => {
            cloud.x += cloud.velocity;
            if (cloud.x > Config.gameSceneWidth) {
                cloud.velocity = Utils.randomInRange(Config.cloud.minSpeed, Config.cloud.maxSpeed);
                cloud.x = -cloud.width / 2;
            }
        });
    }

    destroy() {
        this.world.unregisterEvent("animation-frame", this);
        this.world.unregisterEvent("step", this);
    }
}
