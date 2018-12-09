import Scene from "../base/Scene.js";
import Config from "../../config.js";
import RunOption from "../../run-option.js";
import {Container, Graphics, Rectangle, Text, TextStyle} from "../libs/pixi-wrapper.js";
import {Vec2} from "../libs/planck-wrapper.js";
import Utils from "../utils/Utils";
import GameUtils from "../utils/GameUtils";
import MyWorld from "../MyWorld";
import Background from "../npc/Background";
import Wall from "../npc/Wall";
import Player from "../npc/Player";
import MeteorMgr from "../mgr/MeteorMgr";
import WormMgr from "../mgr/WormMgr";
import HeartMgr from "../mgr/HeartMgr";
import {resources} from "../libs/pixi-wrapper";
import ItemMgr from "../mgr/ItemMgr";

export default class GameScene extends Scene {
    onCreate() {
        this.interactive = true;
        this.buttonMode = true;
        this.hitArea = new Rectangle(0, 0, Config.designWidth, Config.designHeight);
        this.on("pointerdown", this.onPointerdown.bind(this));
        this.on("pointermove", this.onPointermove.bind(this));
        this.on("pointerup", this.onPointerup.bind(this));
        this.on("pointerupoutside", this.onPointerup.bind(this));

        this.gameContainer = new Container();
        if (RunOption.debug) {
            let scale = RunOption.debugScale;
            this.cameraContainer = new Container();
            this.addChild(this.cameraContainer);
            this.cameraContainer.scale.set(scale, scale);
            let cof = (1 - scale) / 2;
            this.cameraContainer.position.set(Config.designWidth * cof, Config.designHeight * cof);
            this.cameraContainer.addChild(this.gameContainer);
        } else {
            this.addChild(this.gameContainer);
        }

        if (RunOption.showDebugInfo) {
            this.createDebugText();
        }

        this.createSurvivalTimeText();

        App.registerEvent("Restart", this.onRestart.bind(this));
    }

    onShow() {
        this.survivalTime = 0;
        this.gameEnded = false;
        this.gameContainer.removeChildren();
        this.gameContainer.position.set(0, 0);
        let pathList = Utils.recursiveValues(Config.imagePath);
        App.loadResources(pathList, this.onLoaded.bind(this));
    }

    onRestart() {
        this.heartMgr.destroy();
        this.heartMgr = undefined;
        this.itemMgr.destroy();
        this.itemMgr = undefined;
        App.ticker.remove(this.onTickHandler);
        this.onShow();
    }

    onLoaded() {
        if (resources.planeScaleTexture === undefined) {
            resources.planeScaleTexture = Config.planeScaleList.map(scale => {
                return Config.imagePath.originPlane.map(path => GameUtils.scaleTexture(resources[path].texture, scale));
            });
            console.log(resources.planeScaleTexture);
        }
        this.world = new MyWorld({gravity: Vec2(0, Config.gravity)});
        this.background = new Background(this.gameContainer);
        this.wall = new Wall(this.world);
        this.plane = new Player(this.world, this.gameContainer);
        this.meteorMgr = new MeteorMgr(this.world, this.gameContainer);
        this.wormMgr = new WormMgr(this.world, this.gameContainer);
        this.heartMgr = new HeartMgr(this.world, this.gameContainer);
        this.itemMgr = new ItemMgr(this.world, this.gameContainer);
        this.onTickHandler = this.onTick.bind(this);
        App.ticker.add(this.onTickHandler);
    }

    onTick(delta) {
        this.survivalTime++;
        this.survivalTimeText.text = `Survival Time:${Math.floor(this.survivalTime / Config.fps * 100) / 100}s`;

        this.world.step(1 / Config.fps);

        if (RunOption.showDebugInfo) {
            this.debugText.text = `FPS:${Math.floor(delta * Config.fps)}
虫子数量：${this.wormMgr.getWormCount()}
陨石数量：${this.meteorMgr.getMeteorCount()}
红心数量：${this.heartMgr.getHeartCount()}`;
        }

        let x = Config.designWidth / 2 - this.plane.sprite.x,
            y = Config.designHeight / 2 - this.plane.sprite.y;
        this.gameContainer.position.set(x, y);

        if (!this.gameEnded && this.plane.isDestroyed()) {
            this.gameEnded = true;
            App.showScene("GameOverScene", this.survivalTime);
        }
    }

    onPointerdown(event) {
        if (this.startPoint) {
            return;
        }
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
            this.plane.setTargetAngle(GameUtils.calcVectorAngle(x, y));

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
        this.plane.setTargetAngle(undefined);
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

    createSurvivalTimeText() {
        let textStyle = new TextStyle({
            fontSize: 50,
            fill: "white"
        });
        this.survivalTimeText = new Text("Survival Time:0", textStyle);
        this.addChild(this.survivalTimeText);
        this.survivalTime = 0;
    }

    createDebugText() {
        let textStyle = new TextStyle({
            fontSize: 40,
            fill: "white"
        });
        this.debugText = new Text("", textStyle);
        this.addChild(this.debugText);
        this.debugText.position.set(0, 50);
    }
}
