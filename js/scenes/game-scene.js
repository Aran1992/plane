import Scene from "../base/scene.js"
import {Container, Graphics, Rectangle, resources, Sprite, Text, TextStyle} from "../libs/pixi-wrapper.js"
import {app} from "../my-application.js"
import config from "../../config.js"
import {Box, Circle, Edge, Vec2, World} from "../libs/planck-wrapper.js"

export default class GameScene extends Scene {
    onCreate() {
        this.interactive = true;
        this.buttonMode = true;
        this.hitArea = new Rectangle(0, 0, config.designWidth, config.designHeight);
        this.on("pointerdown", this.onPointerdown.bind(this));
        this.on("pointermove", this.onPointermove.bind(this));
        this.on("pointerup", this.onPointerup.bind(this));
        this.on("pointerupoutside", this.onPointerup.bind(this));

        this.gameContainer = new Container();
        this.addChild(this.gameContainer);
        this.gameContainerRect = {
            x: 0,
            y: 0,
            width: config.gameSceneWidth,
            height: config.gameSceneHeight
        };

        let textStyle = new TextStyle({
            fontSize: 50,
            fill: "white"
        });

        this.fpsText = new Text("FPS:0", textStyle);
        this.addChild(this.fpsText);

        this.survivalTimeText = new Text("Survival Time:0", textStyle);
        this.addChild(this.survivalTimeText);
        this.survivalTimeText.anchor.set(1, 0);
        this.survivalTimeText.position.set(app.sceneWidth, 0);
        this.survivalTime = 0;

        app.registerEvent("Restart", this.onRestart.bind(this));
    }

    onShow() {
        let imagePathList = [];
        for (let name in config.imagePath) {
            if (config.imagePath.hasOwnProperty(name)) {
                imagePathList.push(config.imagePath[name]);
            }
        }
        app.loadResources([
            config.planeImagePath,
            config.bgImagePath,
            config.meteorImagePath,
            config.wormImagePath,
        ].concat(imagePathList), this.onLoaded.bind(this));
    }

    onRestart() {
        this.survivalTime = 0;
        this.gameEnded = false;
        this.contactFatalItem = false;
        this.gameContainer.removeChildren();
        this.gameContainer.position.set(0, 0);
        this.onLoaded();
    }

    onLoaded() {
        this.world = new World({gravity: Vec2(0, config.gravity)});
        this.world.on("pre-solve", this.onPreSolve.bind(this));
        this.world.on('begin-contact', this.onBeginContact.bind(this));
        this.createBg();
        this.createWall();
        this.createWorms();
        this.createMeteors();
        this.plane = this.createPlane();
        if (this.onUpdateHandler === undefined) {
            this.onUpdateHandler = this.onUpdate.bind(this);
            app.ticker.add(this.onUpdateHandler);
        }
    }

    onPreSolve(contact) {
        let bodyList = [
            contact.getFixtureA().getBody(),
            contact.getFixtureB().getBody(),
        ];
        let index = bodyList.findIndex(body => body.getUserData() && body.getUserData().type === "meteor");
        if (index !== -1) {
            let meteorBody = bodyList[index];
            bodyList.splice(index, 1);
            let wormBody = bodyList[0];
            let userData = wormBody.getUserData();
            if (userData) {
                switch (userData.type) {
                    case "worm": {
                        meteorBody.getUserData().destroied = true;
                        wormBody.getUserData().destroied = true;
                        break;
                    }
                    case "meteor": {
                        contact.setEnabled(false);
                        break;
                    }
                }
            }
        }
    }

    onBeginContact(contact) {
        let fixtureList = [
            contact.getFixtureA(),
            contact.getFixtureB(),
        ];
        let index = fixtureList.map(fixture => fixture.getBody()).indexOf(this.plane.body);
        if (index !== -1) {
            fixtureList.splice(index, 1);
            let userData = fixtureList[0].getBody().getUserData();
            if (userData) {
                switch (userData.type) {
                    case "meteor":
                    case "worm": {
                        if (!this.gameEnded) {
                            this.contactFatalItem = true;
                        }
                        break;
                    }
                }
            }
        }
    }

    onUpdate(delta) {
        this.fpsText.text = `FPS:${Math.floor(delta * config.fps)}`;

        this.survivalTime++;
        this.survivalTimeText.text = `Survival Time:${Math.floor(this.survivalTime / config.fps * 100) / 100}s`;

        if (this.meteorList.length < config.meteorExistMaxCount
            && Math.random() < config.refreshMeteorProbability) {
            let count = config.refreshMeteorMinCount +
                Math.random() * (config.refreshMeteorMaxCount - config.refreshMeteorMinCount);
            for (let i = 0; i < count; i++) {
                this.meteorList.push(this.createMeteor());
            }
        }

        if (this.wormList.length < config.wormExistMaxCount
            && Math.random() < config.refreshWormProbability) {
            let count = 1;
            for (let i = 0; i < count; i++) {
                this.wormList.push(this.createWorm());
            }
        }

        this.wormFollowPlane();

        this.controlPlane();

        this.world.step(1 / config.fps);

        let pos = this.plane.body.getPosition();
        this.plane.pastPos.push(Vec2(pos.x, pos.y));
        if (this.plane.pastPos.length > config.planePastPosLength) {
            this.plane.pastPos.shift();
        }

        [this.wormList, this.meteorList].forEach(list => {
            let index = 0;
            let item = list[index];
            while (item) {
                let ud = item.body.getUserData();
                if (ud && ud.destroied
                    || !this.isPointInRect(item.body.getPosition(), this.gameContainerRect)) {
                    this.world.destroyBody(item.body);
                    item.sprite.parent.removeChild(item.sprite);
                    list.splice(index, 1);
                } else {
                    index++;
                }
                item = list[index];
            }
        });

        [this.plane]
            .concat(this.wormList)
            .concat(this.meteorList)
            .forEach(item => this.syncSpriteWithBody(item));

        let x = config.designWidth / 2 - this.plane.sprite.x,
            y = config.designHeight / 2 - this.plane.sprite.y;
        this.gameContainer.position.set(x, y);

        if (!this.gameEnded && this.contactFatalItem) {
            this.gameEnded = true;
            app.showScene("GameOverScene", this.survivalTime);
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
        let texture = resources[config.bgImagePath].texture;
        let sprite = new Sprite(texture);
        this.gameContainer.addChild(sprite);
        sprite.scale.set(config.gameSceneWidth / texture.width,
            config.gameSceneHeight / texture.height);
        config.bgJson.forEach(item => this.createImage(this.gameContainer, item.texture, item.x, item.y));
    }

    createImage(parent, path, x, y) {
        let sprite = new Sprite(resources[path].texture);
        parent.addChild(sprite);
        sprite.position.set(x, y);
    }

    createWall() {
        let wall = this.world.createBody();
        wall.setUserData({type: "wall"});
        let width = config.gameSceneWidth * config.pixel2meter,
            height = config.gameSceneHeight * config.pixel2meter;
        let opt = {density: 0, friction: 0};
        wall.createFixture(Edge(Vec2(0, 0), Vec2(width, 0)), opt);
        wall.createFixture(Edge(Vec2(width, 0), Vec2(width, height)), opt);
        wall.createFixture(Edge(Vec2(width, height), Vec2(0, height)), opt);
        wall.createFixture(Edge(Vec2(0, height), Vec2(0, 0)), opt);
    }

    createPlane() {
        let sprite = new Sprite(resources[config.planeImagePath].texture);
        this.gameContainer.addChild(sprite);
        sprite.anchor.set(0.5, 0.5);
        sprite.position.set(config.gameSceneWidth / 2, config.gameSceneHeight / 2);

        let body = this.world.createDynamicBody();
        body.createFixture(Circle(config.planeRadius), {friction: 0, density: 1});
        body.setPosition(Vec2(config.gameSceneWidth * config.pixel2meter / 2,
            config.gameSceneHeight * config.pixel2meter / 2));

        return {sprite, body, pastPos: [body.getPosition()]};
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
        body.setAngularVelocity(config.meteorAngularVelocity);

        return {sprite, body};
    }

    createMeteors() {
        this.meteorList = [];
        let count = config.meteorMinCount + Math.random() * (config.meteorMaxCount - config.meteorMinCount);
        for (let i = 0; i < count; i++) {
            this.meteorList.push(this.createMeteor());
        }
    }

    createWorm() {
        let texture = resources[config.wormImagePath].texture;
        let sprite = new Sprite(texture);
        this.gameContainer.addChild(sprite);
        sprite.anchor.set(0.5, 0.5);

        let body = this.world.createDynamicBody();
        let width = texture.width * config.pixel2meter / 2,
            height = texture.height * config.pixel2meter / 2;
        body.createFixture(Box(width, height), {friction: 0, density: 1});

        let {x, y, radian} = this.getRandomInitArgs(texture.width);
        sprite.position.set(x, y);
        sprite.rotation = radian;
        body.setPosition(Vec2(x * config.pixel2meter, y * config.pixel2meter));
        body.setAngle(radian);
        body.setUserData({type: "worm"});

        return {sprite, body};
    }

    createWorms() {
        this.wormList = [];
        let count = config.wormMinCount + Math.random() * (config.wormMaxCount - config.wormMinCount);
        for (let i = 0; i < count; i++) {
            this.wormList.push(this.createWorm());
        }
    }

    getRandomInitArgs(radius) {
        radius = -radius;
        let w = config.gameSceneWidth, h = config.gameSceneHeight;
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

    syncSpriteWithBody(obj) {
        let pos = obj.body.getPosition();
        obj.sprite.position.set(pos.x * config.meter2pixel, pos.y * config.meter2pixel);
        obj.sprite.rotation = obj.body.getAngle();
    }

    controlPlane() {
        let angle = this.plane.body.getAngle();
        if (this.targetAngle) {
            angle = this.calcAngle(angle, this.targetAngle, config.planeAngularVelocity);
        }
        this.plane.body.setAngle(angle);

        this.fireEngine(this.plane, config.planeVelocity, config.planeEngineForce);
    }

    wormFollowPlane() {
        let pp = this.plane.pastPos[0];
        this.wormList.forEach(worm => {
            let wp = worm.body.getPosition();
            let targetAngle = this.getAngle(pp.x - wp.x, pp.y - wp.y);
            let angle = this.calcAngle(worm.body.getAngle(), targetAngle, config.wormAngularVelocity);
            worm.body.setAngle(angle);

            this.fireEngine(worm, config.wormVelocity, config.wormEngineForce);
        });
    }

    fireEngine(obj, targetVelocity, engineForce) {
        let velocity = obj.body.getLinearVelocity();
        let angle = obj.body.getAngle();
        let forceAngle = this.getAngle(targetVelocity * Math.cos(angle) - velocity.x,
            config.planeVelocity * Math.sin(angle) - velocity.y);
        let fx = engineForce * Math.cos(forceAngle);
        let fy = engineForce * Math.sin(forceAngle);
        obj.body.applyLinearImpulse(Vec2(fx, fy), obj.body.getPosition());
        obj.body.setAngularVelocity(0);
    }

    calcAngle(curAngle, targetAngle, angularVelocity) {
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

    isPointInRect(point, rect) {
        return point.x > rect.x
            && point.x < rect.x + rect.width
            && point.y > rect.y
            && point.y < rect.y + rect.height;
    }
}
