import Scene from "../base/scene.js"
import {Container, Graphics, Rectangle, resources, Sprite, Text, TextStyle} from "../libs/pixi-wrapper.js"
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

        let textStyle = new TextStyle({
            fontSize: 50,
            fill: "white"
        },);

        this.fpsText = new Text("FPS:0", textStyle);
        this.addChild(this.fpsText);

        this.countText = new Text("count:0", textStyle);
        this.addChild(this.countText);
        this.countText.anchor.set(1, 0);
        this.countText.position.set(app.sceneWidth, 0);
        this.count = 0;
    }

    onShow() {
        app.loadResources([
            config.planeImagePath,
            config.bgImagePath,
            config.meteorImagePath,
        ], this.onLoaded.bind(this));
    }

    onLoaded() {
        this.world = new World({gravity: Vec2(0, config.gravity)});
        // this.world.on("pre-solve", this.onPreSolve.bind(this));
        this.world.on('begin-contact', this.onBeginContact.bind(this));
        this.createBg();
        this.createWall();
        this.createPlane();
        this.meteorList = [];
        let count = config.meteorMinCount + Math.random() * (config.meteorMaxCount - config.meteorMinCount);
        for (let i = 0; i < count; i++) {
            this.meteorList.push(this.createMeteor());
        }
        app.ticker.add(this.onUpdate.bind(this));
    }

    onPreSolve(contact) {
        let bodyList = [
            contact.getFixtureA().getBody(),
            contact.getFixtureB().getBody(),
        ];
        let index = bodyList.findIndex(body => body.getUserData() && body.getUserData().type === "meteor");
        if (index !== -1) {
            bodyList.splice(index, 1);
            let body = bodyList[0];
            let userData = body.getUserData();
            if (userData && userData.type === "wall") {
                contact.setEnabled(false);
            }
        }
    }

    onBeginContact(contact) {
        let fixtureList = [
            contact.getFixtureA(),
            contact.getFixtureB(),
        ];
        let index = fixtureList.map(fixture => fixture.getBody()).indexOf(this.planeBody);
        if (index !== -1) {
            fixtureList.splice(index, 1);
            let userData = fixtureList[0].getBody().getUserData();
            if (userData && userData.type === "meteor") {
                this.count++;
                this.countText.text = `count:${this.count}`;
            }
        }
    }

    onUpdate(delta) {
        this.fpsText.text = `FPS:${Math.floor(delta * config.fps)}`;

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

        let velocity = this.planeBody.getLinearVelocity();
        let forceAngle = this.getAngle(config.planeVelocity * Math.cos(angle) - velocity.x,
            config.planeVelocity * Math.sin(angle) - velocity.y);
        let fx = config.planeEngineForce * Math.cos(forceAngle);
        let fy = config.planeEngineForce * Math.sin(forceAngle);
        this.planeBody.applyLinearImpulse(Vec2(fx, fy), this.planeBody.getPosition());

        this.planeBody.setAngularVelocity(0);

        this.world.step(1 / config.fps);

        let pos = this.planeBody.getPosition();
        this.planeSprite.position.set(pos.x * config.meter2pixel, pos.y * config.meter2pixel);
        this.planeSprite.rotation = angle;

        this.meteorList.forEach(meteor => {
            let pos = meteor.body.getPosition();
            meteor.sprite.position.set(pos.x * config.meter2pixel, pos.y * config.meter2pixel);
            meteor.sprite.rotation = meteor.body.getAngle();
        });

        if (this.meteorList.length < config.meteorExistMaxCount && Math.random() < config.refreshMeteorProbability) {
            let count = config.refreshMeteorMinCount + Math.random() * (config.refreshMeteorMaxCount - config.refreshMeteorMinCount);
            for (let i = 0; i < count; i++) {
                this.meteorList.push(this.createMeteor());
            }
        }
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

        wall.setUserData({type: "wall"});

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
        this.planeBody.createFixture(Circle(config.planeRadius), {friction: 0, density: 1});
        this.planeBody.setPosition(Vec2(config.designWidth * config.pixel2meter / 2,
            config.designHeight * config.pixel2meter / 2));
    }

    createMeteor() {
        let sprite = new Sprite(resources[config.meteorImagePath].texture);
        this.gameContainer.addChild(sprite);
        sprite.anchor.set(0.5, 0.5);

        let body = this.world.createDynamicBody();
        body.createFixture(Circle(config.meteorRadius), {
            friction: 0,
            density: 1,
            restitution: config.meteorRestitution
        });
        body.setUserData({type: "meteor"});

        let {x, y, radian, velocity} = this.getRandomInitArgs(config.meteorRadius * config.meter2pixel);
        sprite.position.set(x, y);
        sprite.rotation = radian;
        body.setPosition(Vec2(x * config.pixel2meter, y * config.pixel2meter));
        body.setAngle(radian);

        body.setLinearVelocity(Vec2(velocity * Math.cos(radian), velocity * Math.sin(radian)));
        body.setAngularVelocity(5);

        return {sprite, body};
    }

    getRandomInitArgs(radius) {
        radius = -radius;
        let w = config.designWidth, h = config.designHeight;
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
        args.velocity = config.meteorMinVelocity + Math.random() * (config.meteorMaxVelocity - config.meteorMinVelocity);
        return args;
    }
}