import Plane from "./Plane";

export default class Enemy extends Plane {
    constructor(mgr, ...args) {
        super(...args);
        this.mgr = mgr;
    }

    onStep() {
        super.onStep();
        this.setTargetAngle(Math.random() * Math.PI * 2);
    }

    destroy() {
        super.destroy();
        this.mgr.removeChild(this);
    }

    afterDestroyed() {
        App.dispatchEvent("EnemyContacted");
    }
}
