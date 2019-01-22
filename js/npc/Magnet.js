import {Vec2} from "../libs/planck-wrapper";
import Utils from "../utils/Utils";
import Config from "../../config";
import GameUtils from "../utils/GameUtils";

export default class Magnet {
    constructor(sprite) {
        this.sprite = sprite;
        this.countDown = Config.magnet.duration * Config.fps;
        App.getScene("GameScene").showTakenMagnetIcon(true);
    }

    onStep() {
        this.itemMgr = App.getScene("GameScene").itemMgr;
        if (this.itemMgr && this.itemMgr.item) {
            let item = this.itemMgr.item;
            let distance = Utils.calcPointsDistance(item.sprite.position, this.sprite.position);
            let itemRadius = item.sprite.width > item.sprite.height ? item.sprite.width : item.sprite.height;
            if (distance < itemRadius + Config.magnet.radius) {
                let radians = GameUtils.calcVectorAngle(this.sprite.x - item.sprite.x, this.sprite.y - item.sprite.y);
                let x = item.body.getPosition().x + Math.cos(radians) * Config.magnet.velocity;
                let y = item.body.getPosition().y + Math.sin(radians) * Config.magnet.velocity;
                item.body.setPosition(Vec2(x, y));
            }
        }
        this.countDown--;
        if (this.countDown === 0) {
            this.destroy();
        }
    }

    destroy() {
        App.getScene("GameScene").showTakenMagnetIcon(false);
        this.destroyed = true;
    }
}
