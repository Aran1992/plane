import Plane from "./Plane";
import GameUtils from "../utils/GameUtils";
import Config from "../../config";

export default class Enemy extends Plane {
    constructor(mgr, ...args) {
        super(...args);
        this.mgr = mgr;
    }

    onStep() {
        super.onStep();
        if (!this.destroyed) {
            this.followPlayer();
        }
    }

    destroy() {
        super.destroy();
        this.mgr.removeChild(this);
    }

    afterDestroyed() {
        App.dispatchEvent("EnemyContacted");
        if (Math.random() < Config.enemy.explodedDropFuncItemProbability) {
            App.getScene("GameScene").itemMgr.refreshItem(this.explodedPosition);
        }
    }

    followPlayer() {
        let player = App.getScene("GameScene").player;
        if (!player.isDestroyed()) {
            let pp = player.getPastPosition();
            let wp = this.body.getPosition();
            let targetAngle = GameUtils.calcVectorAngle(pp.x - wp.x, pp.y - wp.y);
            let angle = GameUtils.calcStepAngle(this.body.getAngle(), targetAngle, Config.wormAngularVelocity);
            this.body.setAngle(angle);
            GameUtils.fireEngine(this, Config.wormVelocity, Config.wormEngineForce);
        }
    }
}
