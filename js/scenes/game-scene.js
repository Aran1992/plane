import Scene from "../base/scene.js"
import {Container, Graphics, Rectangle, resources, Sprite} from "../libs/pixi-wrapper.js"
import {app} from "../my-application.js"
import config from "../../config.js"
import {Circle, Edge, Vec2, World} from "../libs/planck-wrapper.js"

export default class GameScene extends Scene {
    onCreate() {
        this.gameContainer = new Container();
        this.addChild(this.gameContainer);
        this.gameContainer.interactive = true;
        this.gameContainer.buttonMode = true;
        this.gameContainer.hitArea = new Rectangle(0, 0, config.designWidth, config.designHeight);
        this.gameContainer.on("pointerdown", this.onPointerdown.bind(this));
        this.gameContainer.on("pointermove", this.onPointermove.bind(this));
        this.gameContainer.on("pointerup", this.onPointerup.bind(this));
        this.gameContainer.on("pointerupoutside", this.onPointerup.bind(this));
    }

    onShow() {
        app.loadResources([
            config.planeImagePath,
            config.bgImagePath,
        ], this.onLoaded.bind(this));
    }

    onLoaded() {
        this.world = new World({gravity: Vec2(0, config.gravity)});
        this.createBg();
        this.createWall();
        this.createPlane();
        app.ticker.add(this.onUpdate.bind(this));
    }

    onUpdate() {
        let angle = this.planeBody.getAngle();
        if (angle < 0) {
            angle = 2 * Math.PI + angle;
        }
        if (this.targetAngle && angle !== this.targetAngle) {
            if (this.targetAngle > angle) {
                let diff = this.targetAngle - angle;
                let diff2 = 2 * Math.PI - diff;
                if (diff < diff2) {
                    if (config.planeAngleVelocity > diff) {
                        angle = this.targetAngle;
                    } else {
                        angle += config.planeAngleVelocity;
                    }
                } else {
                    if (config.planeAngleVelocity > diff2) {
                        angle = this.targetAngle;
                    } else {
                        angle -= config.planeAngleVelocity;
                    }
                }
            } else if (this.targetAngle < angle) {
                let diff = angle - this.targetAngle;
                let diff2 = 2 * Math.PI - diff;
                if (diff < diff2) {
                    if (config.planeAngleVelocity > diff) {
                        angle = this.targetAngle;
                    } else {
                        angle -= config.planeAngleVelocity;
                    }
                } else {
                    if (config.planeAngleVelocity > diff2) {
                        angle = this.targetAngle;
                    } else {
                        angle += config.planeAngleVelocity;
                    }
                }
            }
            this.planeBody.setAngle(angle);
        }

        // let tvx = config.planeVelocity * Math.cos(angle);
        // let tvy = config.planeVelocity * Math.sin(angle);
        // let cv = this.planeBody.getLinearVelocity();
        // let forceAngle = this.getAngle(tvx - cv.x, tvy - cv.y);

        let fx = config.planeEngineForce * Math.cos(angle);
        let fy = config.planeEngineForce * Math.sin(angle);
        this.planeBody.applyLinearImpulse(Vec2(fx, fy), this.planeBody.getPosition());

        this.planeBody.setAngularVelocity(0);

        this.world.step(1 / config.fps);

        let pos = this.planeBody.getPosition();
        this.planeSprite.position.set(pos.x * config.meter2pixel, pos.y * config.meter2pixel);
        this.planeSprite.rotation = angle;
    }

    onPointerdown(event) {
        this.startPoint = {x: event.data.global.x, y: event.data.global.y};

        this.startPointCircle = new Graphics();
        this.addChild(this.startPointCircle);
        this.startPointCircle.beginFill(0xff0000);
        this.startPointCircle.drawCircle(0, 0, 5);
        this.startPointCircle.endFill();
        this.startPointCircle.position.set(this.startPoint.x, this.startPoint.y);

        this.endPointCircle = new Graphics();
        this.addChild(this.endPointCircle);
        this.endPointCircle.beginFill(0x00ff00);
        this.endPointCircle.drawCircle(0, 0, 5);
        this.endPointCircle.endFill();
        this.endPointCircle.position.set(this.startPoint.x, this.startPoint.y);
    }

    getAngle(x, y) {
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

    onPointermove(event) {
        if (this.startPoint) {
            let y = event.data.global.y - this.startPoint.y;
            let x = event.data.global.x - this.startPoint.x;
            this.targetAngle = this.getAngle(x, y);

            this.endPointCircle.position.set(event.data.global.x, event.data.global.y);
            if (this.directionLine) {
                this.directionLine.parent.removeChild(this.directionLine);
            }
            this.directionLine = new Graphics();
            this.addChild(this.directionLine);
            this.directionLine.beginFill(0x0000ff);
            this.directionLine.lineStyle(5, 0x0000ff, 0.5, 0.5);
            this.directionLine.moveTo(this.startPoint.x, this.startPoint.y);
            this.directionLine.lineTo(event.data.global.x, event.data.global.y);
            this.directionLine.endFill();
        }
    }

    onPointerup() {
        this.startPoint = undefined;
        this.targetAngle = undefined;
        if (this.startPointCircle) {
            this.startPointCircle.parent.removeChild(this.startPointCircle);
            this.startPointCircle = undefined;
        }
        if (this.endPointCircle) {
            this.endPointCircle.parent.removeChild(this.endPointCircle);
            this.endPointCircle = undefined;
        }
        if (this.directionLine) {
            this.directionLine.parent.removeChild(this.directionLine);
            this.directionLine = undefined;
        }
    }

    createBg() {
        let sprite = new Sprite(resources[config.bgImagePath].texture);
        this.gameContainer.addChild(sprite);
    }

    createWall() {
        let wall = this.world.createBody();

        let opt = {density: 0, friction: 0};
        wall.createFixture(Edge(Vec2(0, 0),
            Vec2(config.designWidth * config.pixel2meter, 0)),
            opt);

        wall.createFixture(Edge(Vec2(config.designWidth * config.pixel2meter, 0),
            Vec2(config.designWidth * config.pixel2meter, config.designHeight * config.pixel2meter)),
            opt);

        wall.createFixture(Edge(Vec2(config.designWidth * config.pixel2meter, config.designHeight * config.pixel2meter),
            Vec2(0, config.designHeight * config.pixel2meter)),
            opt);

        wall.createFixture(Edge(Vec2(0, config.designHeight * config.pixel2meter),
            Vec2(0, 0)),
            opt);
    }

    createPlane() {
        this.planeSprite = new Sprite(resources[config.planeImagePath].texture);
        this.gameContainer.addChild(this.planeSprite);
        this.planeSprite.anchor.set(0.5, 0.5);
        this.planeSprite.position.set(config.planeRadius * config.meter2pixel, config.planeRadius * config.meter2pixel);

        this.planeBody = this.world.createDynamicBody();
        this.planeBody.createFixture(Circle(config.planeRadius), {friction: 1, density: 1});
        this.planeBody.setPosition(Vec2(config.designWidth * config.pixel2meter / 2,
            config.designHeight * config.pixel2meter / 2));
        // this.planeBody.setLinearVelocity(Vec2(config.planeVelocity, 0));
    }

}