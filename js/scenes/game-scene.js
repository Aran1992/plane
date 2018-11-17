import Scene from "../base/scene.js"
import {Container, Rectangle, resources, Sprite} from "../libs/pixi-wrapper.js"
import {app} from "../my-application.js"
import config from "../../config.js"
import {Box, Vec2, World} from "../libs/planck-wrapper.js"

export default class GameScene extends Scene {
    onCreate() {
        this.gameContainer = new Container();
        this.addChild(this.gameContainer);
        this.gameContainer.interactive = true;
        this.gameContainer.buttonMode = true;
        this.gameContainer.hitArea = new Rectangle(0, 0, config.designWidth, config.designHeight);
        this.gameContainer.on("pointerdown", this.onPointerdown.bind(this));
        this.gameContainer.on("pointerup", this.onPointerup.bind(this));
        this.gameContainer.on("pointerupoutside", this.onPointerup.bind(this));
        this.gameContainer.on("pointermove", this.onPointermove.bind(this));
    }

    onShow() {
        app.loadResources([config.planeImagePath], this.onLoaded.bind(this));
    }

    onLoaded() {
        this.world = new World({gravity: Vec2(0, config.gravity)});
        this.createPlane();
        app.ticker.add(this.onUpdate.bind(this));
    }

    onUpdate() {
        this.planeBody.setAngle(this.planeBody.getAngle() + 0.01);
        this.world.step(1 / config.fps);
        let pos = this.planeBody.getPosition();
        this.planeSprite.position.set(pos.x * config.meter2pixel, pos.y * config.meter2pixel);
        let angle = this.planeBody.getAngle();
        this.planeSprite.rotation = angle;
        let x = config.planeVelocity * Math.cos(angle);
        let y = config.planeVelocity * Math.sin(angle);
        this.planeBody.setLinearVelocity(Vec2(x, y));
    }

    onPointerdown(...args) {
        // console.log("down", ...args);
    }

    onPointerup(...args) {
        // console.log("up", ...args);
    }

    onPointermove(...args) {
        // console.log("move", ...args);
    }

    createPlane() {
        this.planeSprite = new Sprite(resources[config.planeImagePath].texture);
        this.gameContainer.addChild(this.planeSprite);
        this.planeSprite.anchor.set(0.5, 0.5);
        this.planeSprite.position.set(config.planeHalfWidth * config.meter2pixel, config.planeHalfHeight * config.meter2pixel);
        this.planeBody = this.world.createDynamicBody();
        this.planeBody.createFixture(Box(config.planeHalfWidth, config.planeHalfHeight), {friction: 1, density: 1});
        this.planeBody.setPosition(Vec2(config.planeHalfWidth, config.planeHalfHeight));
    }
}