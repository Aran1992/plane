import {Vec2} from "../libs/planck-wrapper";
import Utils from "../utils/Utils";
import Config from "../../config";
import GameUtils from "../utils/GameUtils";
import {resources, Sprite} from "../libs/pixi-wrapper";

export default class Magnet {
    constructor(parentSprite) {
        this.parentSprite = parentSprite;
        this.frames = Config.imagePath.magnetCircle.map(path => resources[path].texture);
        this.frameIndex = 0;
        this.sprite = this.parentSprite.addChild(new Sprite(this.frames[this.frameIndex]));
        this.sprite.anchor.set(0.5, 0.5);
        this.countDown = Config.magnet.duration * Config.fps;
    }

    onStep() {
        let gameScene = App.getScene("GameScene");
        gameScene.itemMgr.itemList.concat(gameScene.weaponItemMgr.itemList)
            .forEach(item => this.abstractItem(item));
        this.countDown--;
        if (this.countDown === 0) {
            this.destroy();
        }
    }

    onAnimationFrame() {
        this.frameIndex++;
        if (this.frames[this.frameIndex] === undefined) {
            this.frameIndex = 0;
        }
        this.sprite.texture = this.frames[this.frameIndex];
    }

    abstractItem(item) {
        let distance = Utils.calcPointsDistance(item.sprite.position, this.parentSprite.position);
        let itemRadius = item.sprite.width > item.sprite.height ? item.sprite.width : item.sprite.height;
        if (distance < itemRadius + Config.magnet.radius) {
            let radians = GameUtils.calcPointVectorAngle(item.sprite, this.parentSprite);
            let x = item.body.getPosition().x + Math.cos(radians) * Config.magnet.velocity;
            let y = item.body.getPosition().y + Math.sin(radians) * Config.magnet.velocity;
            item.body.setPosition(Vec2(x, y));
        }
    }

    destroy() {
        this.sprite.destroy();
        this.destroyed = true;
    }
}
