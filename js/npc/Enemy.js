import Plane from "./Plane";
import GameUtils from "../utils/GameUtils";
import Config from "../../config";
import Utils from "../utils/Utils";

export default class Enemy extends Plane {
    constructor(mgr, ...args) {
        super(...args);
        this.mgr = mgr;
        let range = this.config.moveAroundDistanceRange;
        this.moveAroundDistance = Utils.randomInRange(range[0], range[1]) * Config.pixel2meter;
    }

    onStep() {
        super.onStep();
        if (!this.destroyed) {
            this.moveAroundPlayer();
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

    moveAroundPlayer() {
        let player = App.getScene("GameScene").player;
        if (!player.isDestroyed()) {
            let pp = player.body.getPosition();
            let ep = this.body.getPosition();
            let distance = Utils.calcPointsDistance(ep, pp);
            let targetAngle;
            if (distance > this.getMoveAroundDistance()) {
                let angle1 = Math.asin(this.getMoveAroundDistance() / distance);
                let angle2 = GameUtils.calcPointVectorAngle(ep, pp);
                targetAngle = angle1 + angle2;
            } else {
                targetAngle = GameUtils.calcPointVectorAngle(pp, ep) - Math.PI / 2;
            }
            let angle = GameUtils.calcStepAngle(this.body.getAngle(), targetAngle, this.config.planeAngularVelocity);
            this.body.setAngle(angle);
            GameUtils.fireEngine(this, Config.wormVelocity, Config.wormEngineForce);
        }
    }

    getMoveAroundDistance() {
        return this.moveAroundDistance;
    }
}
