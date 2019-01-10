import Scene from "../base/Scene.js";
import Config from "../../config.js";
import RunOption from "../../run-option.js";
import {Container, Rectangle, Text, TextStyle} from "../libs/pixi-wrapper.js";
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
import {resources, Sprite} from "../libs/pixi-wrapper";
import ItemMgr from "../mgr/ItemMgr";
import AnimationMgr from "../mgr/AnimationMgr";

export default class GameScene extends Scene {
    onCreate() {
        this.controlRect = {
            x: 0,
            y: Config.designHeight - Config.controlRect.height,
            width: Config.controlRect.width,
            height: Config.controlRect.height
        };
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
        this.createLifeText();
        this.createTakenBombIcon();
        this.createTakenMagnetIcon();

        App.registerEvent("Restart", this.onRestart.bind(this));
    }

    onShow() {
        this.survivalTime = 0;
        this.gameEnded = false;
        this.gameContainer.removeChildren();
        this.gameContainer.position.set(0, 0);
        this.world = new MyWorld({gravity: Vec2(0, Config.gravity)});
        this.background = new Background(this.world, this.gameContainer);
        this.wall = new Wall(this.world);
        this.plane = new Player(this.world, this.gameContainer);
        this.meteorMgr = new MeteorMgr(this.world, this.gameContainer);
        this.wormMgr = new WormMgr(this.world, this.gameContainer);
        this.heartMgr = new HeartMgr(this.world, this.gameContainer);
        this.itemMgr = new ItemMgr(this.world, this.gameContainer);
        this.animationMgr = new AnimationMgr(this.world, this.gameContainer);
        this.onTickHandler = this.onTick.bind(this);
        App.ticker.add(this.onTickHandler);
    }

    onRestart() {
        this.onHide();
        this.onShow();
    }

    onHide() {
        this.heartMgr.destroy();
        this.heartMgr = undefined;
        this.itemMgr.destroy();
        this.itemMgr = undefined;
        this.animationMgr.destroy();
        this.animationMgr = undefined;
        this.background.destroy();
        this.background = undefined;
        this.lifeCount = 1;
        App.ticker.remove(this.onTickHandler);
    }

    onTick(delta) {
        if (!this.gameEnded) {
            this.survivalTime++;
            this.survivalTimeText.text = `生存时间：${Math.floor(this.survivalTime / Config.fps * 100) / 100}s`;
        }

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
        if (this.startPoint
            || !Utils.isPointInRect(event.data.global, this.controlRect)) {
            return;
        }

        let targetAngle = this.plane.sprite.rotation;
        let x = event.data.global.x - Math.cos(targetAngle) * Config.rockerRadius;
        let y = event.data.global.y - Math.sin(targetAngle) * Config.rockerRadius;
        this.startPoint = {x: x, y: y};

        this.startPointCircle = new Sprite(resources[Config.imagePath.rockerBottom].texture);
        this.addChild(this.startPointCircle);
        this.startPointCircle.anchor.set(0.5, 0.5);
        this.startPointCircle.position.set(this.startPoint.x, this.startPoint.y);

        this.endPointCircle = new Sprite(resources[Config.imagePath.rocker].texture);
        this.addChild(this.endPointCircle);
        this.endPointCircle.anchor.set(0.5, 0.5);
        this.endPointCircle.position.set(event.data.global.x, event.data.global.y);
    }

    onPointermove(event) {
        if (this.startPoint) {
            let y = event.data.global.y - this.startPoint.y;
            let x = event.data.global.x - this.startPoint.x;
            let targetAngle = GameUtils.calcVectorAngle(x, y);
            this.plane.setTargetAngle(targetAngle);

            let ex = this.startPoint.x + Math.cos(targetAngle) * Config.rockerRadius,
                ey = this.startPoint.y + Math.sin(targetAngle) * Config.rockerRadius;
            this.endPointCircle.position.set(ex, ey);
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
    }

    setLifeCount(count) {
        this.lifeCount = count;
        this.lifeText.text = `再碰撞几次就会爆炸:${this.lifeCount}`;
    }

    createSurvivalTimeText() {
        let textStyle = new TextStyle({
            fontSize: 50,
            fill: "white"
        });
        this.survivalTimeText = new Text("生存时间:0", textStyle);
        this.addChild(this.survivalTimeText);
        this.survivalTime = 0;
    }

    createLifeText() {
        let textStyle = new TextStyle({
            fontSize: 50,
            fill: "white"
        });
        this.lifeCount = 1;
        this.lifeText = new Text("", textStyle);
        this.lifeText.text = `再碰撞几次就会爆炸:${this.lifeCount}`;
        this.lifeText.anchor.set(1, 0);
        this.lifeText.position.set(Config.designWidth, 0);
        this.addChild(this.lifeText);
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

    isPointInView(pos) {
        let rect = {
            x: -this.gameContainer.x,
            y: -this.gameContainer.y,
            width: Config.designWidth,
            height: Config.designHeight
        };
        return Utils.isPointInRect(pos, rect);
    }

    createTakenBombIcon() {
        this._takenBombIcon = Sprite.fromImage("images/bomb.png");
        this._takenBombIcon.anchor.set(1, 0);
        let x = Config.designWidth - Config.bombIconPos.x - this.lifeText.width - 5;
        this._takenBombIcon.position.set(x, Config.bombIconPos.y);
        this._takenBombIcon.visible = false;
        this.addChild(this._takenBombIcon);
    }

    showTakenBombIcon(visible) {
        this._takenBombIcon.visible = visible;
    }

    createTakenMagnetIcon() {
        this._takenMagnetIcon = Sprite.fromImage("images/magnet.png");
        this._takenMagnetIcon.anchor.set(1, 0);
        let x = Config.designWidth - Config.magnetIconPos.x - this.lifeText.width - 5;
        this._takenMagnetIcon.position.set(x, Config.magnetIconPos.y);
        this._takenMagnetIcon.visible = false;
        this.addChild(this._takenMagnetIcon);
    }

    showTakenMagnetIcon(visible) {
        this._takenMagnetIcon.visible = visible;
    }
}

GameScene.resPathList = Utils.recursiveValues(Config.imagePath);
