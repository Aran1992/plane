import Config from "../../config";
import {Vec2} from "../libs/planck-wrapper";
import {Texture} from "../libs/pixi-wrapper";

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

    static getNpcRandomInitArgs(init) {
        let w = Config.gameSceneWidth,
            h = Config.gameSceneHeight;
        let length = (w + h) * 2;
        let pos = Math.random() * length;
        if (pos < w) {
            let offset = init ? Config.worldViewRectMargin : Config.designHeight / 2;
            return {
                x: pos,
                y: -offset,
                radian: GameUtils.randomInRange(GameUtils.calcRandomAngleRange(w, pos, offset))
            };
        } else if (pos < w + h) {
            let offset = init ? Config.worldViewRectMargin : Config.designWidth / 2;
            return {
                x: w + offset,
                y: pos - w,
                radian: Math.PI / 2 + GameUtils.randomInRange(GameUtils.calcRandomAngleRange(h, pos - w, offset))
            };
        } else if (pos < w * 2 + h) {
            let offset = init ? Config.worldViewRectMargin : Config.designHeight / 2;
            return {
                x: pos - w - h,
                y: h + offset,
                radian: Math.PI + GameUtils.randomInRange(GameUtils.calcRandomAngleRange(w, pos - w - h, offset))
            };
        } else {
            let offset = init ? Config.worldViewRectMargin : Config.designWidth / 2;
            return {
                x: -offset,
                y: pos - w - w - h,
                radian: Math.PI / 2 * 3 + GameUtils.randomInRange(GameUtils.calcRandomAngleRange(h, pos - w - w - h, offset))
            };
        }
    }

    static calcRandomAngleRange(length, pos, offset) {
        let min = Math.atan(offset / (length - pos));
        let max = Math.PI - Math.atan(offset / pos);
        return [min, max];
    }

    static randomInRange([min, max]) {
        return min + Math.random() * (max - min);
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

    static physicalPos2renderPos(pp) {
        return {
            x: pp.x * Config.meter2pixel,
            y: pp.y * Config.meter2pixel
        };
    }

    static scaleTexture(texture, scale) {
        let data = GameUtils.getTextureData(texture);
        let canvas = document.createElement("canvas");
        canvas.width = `${texture.width * scale}`;
        canvas.height = `${texture.height * scale}`;
        let ctx = canvas.getContext("2d");
        for (let i = 0; i < data.length; i += 4) {
            ctx.fillStyle = `rgba(${data[i]},${data[i + 1]},${data[i + 2]},${data[i + 3]})`;
            let column = i / 4 % texture.width, row = Math.floor(i / 4 / texture.width);
            ctx.fillRect(column * scale, row * scale, scale, scale);
        }
        return Texture.fromCanvas(canvas);
    }

    static getTextureData(texture) {
        let canvas = document.createElement("canvas");
        canvas.width = `${texture.width}`;
        canvas.height = `${texture.height}`;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(texture.baseTexture.source, 0, 0, texture.width, texture.height);
        return ctx.getImageData(0, 0, texture.width, texture.height).data;
    }
}
