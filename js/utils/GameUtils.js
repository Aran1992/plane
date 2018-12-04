import Config from "../../config";
import {Vec2} from "../libs/planck-wrapper";

const worldEventList = [
    "pre-solve",
    "begin-contact",
    "step"
];

export default class GameUtils {
    static syncSpriteWithBody(obj) {
        let pos = obj.body.getPosition();
        obj.sprite.position.set(pos.x * Config.meter2pixel, pos.y * Config.meter2pixel);
        obj.sprite.rotation = obj.body.getAngle();
    }

    static destroyPhysicalSprite(obj) {
        obj.sprite.parent.removeChild(obj.sprite);
        obj.world.destroyBody(obj.body);
        worldEventList.forEach(event => obj.world.unregisterEvent(event, obj));
        obj.destroyed = true;
    }

    static getNpcRandomInitArgs(radius) {
        let w = Config.gameSceneWidth, h = Config.gameSceneHeight;
        let length = (w + h) * 2;
        let pos = Math.random() * length;
        let radian = Math.random() * Math.PI;
        let args;
        if (pos < w) {
            args = {x: pos, y: -radius, radian: radian};
        } else if (pos < w + h) {
            args = {x: w + radius, y: pos - w, radian: Math.PI / 2 + radian};
        } else if (pos < w * 2 + h) {
            args = {x: pos - w - h, y: h + radius, radian: Math.PI + radian};
        } else {
            args = {x: -radius, y: pos - w * w - h, radian: Math.PI / 2 * 3 + radian};
        }
        args.velocity = Config.meteorMinVelocity + Math.random() * (Config.meteorMaxVelocity - Config.meteorMinVelocity);
        return args;
    }

    static calcStepAngle(curAngle, targetAngle, angularVelocity) {
        if (curAngle < 0) {
            curAngle += 2 * Math.PI;
        }
        if (curAngle !== targetAngle) {
            if (targetAngle > curAngle) {
                let diff = targetAngle - curAngle;
                let diff2 = 2 * Math.PI - diff;
                if (diff < diff2) {
                    if (angularVelocity > diff) {
                        curAngle = targetAngle;
                    } else {
                        curAngle += angularVelocity;
                    }
                } else {
                    if (angularVelocity > diff2) {
                        curAngle = targetAngle;
                    } else {
                        curAngle -= angularVelocity;
                    }
                }
            } else if (targetAngle < curAngle) {
                let diff = curAngle - targetAngle;
                let diff2 = 2 * Math.PI - diff;
                if (diff < diff2) {
                    if (angularVelocity > diff) {
                        curAngle = targetAngle;
                    } else {
                        curAngle -= angularVelocity;
                    }
                } else {
                    if (angularVelocity > diff2) {
                        curAngle = targetAngle;
                    } else {
                        curAngle += angularVelocity;
                    }
                }
            }
        }
        return curAngle;
    }

    static calcVectorAngle(x, y) {
        let angle;
        if (x === 0) {
            if (y > 0) {
                return Math.PI / 2;
            } else if (y < 0) {
                return Math.PI / 2 * 3;
            } else {
                return 0;
            }
        }
        if (y === 0) {
            if (x > 0) {
                return 0;
            } else {
                return Math.PI;
            }
        }
        if (x > 0 && y > 0) {
            angle = Math.atan(y / x);
        } else if (x < 0 && y > 0) {
            angle = Math.PI + Math.atan(y / x);
        } else if (x < 0 && y < 0) {
            angle = Math.atan(y / x) - Math.PI;
        } else if (x > 0 && y < 0) {
            angle = Math.atan(y / x);
        }
        if (angle < 0) {
            angle = 2 * Math.PI + angle;
        }
        return angle;
    }

    static fireEngine(obj, targetVelocity, engineForce) {
        let velocity = obj.body.getLinearVelocity();
        let angle = obj.body.getAngle();
        let forceAngle = GameUtils.calcVectorAngle(targetVelocity * Math.cos(angle) - velocity.x,
            targetVelocity * Math.sin(angle) - velocity.y);
        let fx = engineForce * Math.cos(forceAngle);
        let fy = engineForce * Math.sin(forceAngle);
        obj.body.applyLinearImpulse(Vec2(fx, fy), obj.body.getPosition());
        obj.body.setAngularVelocity(0);
    }

    static cleanDestroyedNpc(list) {
        let index = 0;
        let item = list[index];
        while (item) {
            if (item.isDestroyed()) {
                list.splice(index, 1);
            } else {
                index++;
            }
            item = list[index];
        }
    }
}
