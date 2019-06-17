import Plane from "./Plane";

export default class Enemy extends Plane {
    onStep() {
        super.onStep();
        this.setTargetAngle(Math.random() * Math.PI * 2);
    }
}