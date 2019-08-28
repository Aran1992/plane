import Config from "../../config.js";
import RunOption from "../../run-option.js";
import Scene from "../base/Scene.js";
import {Container, Rectangle, resources, Sprite, Text, TextStyle} from "../libs/pixi-wrapper.js";
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
import ItemMgr from "../mgr/ItemMgr";
import AnimationMgr from "../mgr/AnimationMgr";
import DataMgr from "../mgr/DataMgr";
import MusicMgr from "../mgr/MusicMgr";
import Bullet from "../npc/Bullet";
import EnemyMgr from "../mgr/EnemyMgr";

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

        this.createRemainEnemyCountText();
        this.createLifePanel();
        this.createBombPanel();

        App.registerEvent("Restart", this.onRestart.bind(this));
    }

    onShow() {
        this.gameEnded = false;
        this.gameContainer.removeChildren();
        this.gameContainer.position.set(0, 0);
        this.world = new MyWorld({gravity: Vec2(0, Config.gravity)});
        this.background = new Background(this.world, this.gameContainer);
        this.wall = new Wall(this.world);
        this.createPlayer();
        this.enemyMgr = new EnemyMgr(this.world, this.gameContainer);
        this.meteorMgr = new MeteorMgr(this.world, this.gameContainer);
        this.wormMgr = new WormMgr(this.world, this.gameContainer);
        this.heartMgr = new HeartMgr(this.world, this.gameContainer);
        this.itemMgr = new ItemMgr(this.gameContainer, this.world, "Func", Config.imagePath.item, Config.item);
        this.weaponItemMgr = new ItemMgr(this.gameContainer, this.world, "Weapon", Config.imagePath.weaponItem, Config.weaponItem);
        this.animationMgr = new AnimationMgr(this.world, this.gameContainer);
        this.onTickHandler = this.onTick.bind(this);
        App.ticker.add(this.onTickHandler);
        MusicMgr.playBGM(Config.soundPath.bgm);
    }

    onRestart() {
        this.onHide();
        this.onShow();
    }

    onHide() {
        this.heartMgr.destroy();
        this.itemMgr.destroy();
        this.animationMgr.destroy();
        this.background.destroy();
        this.weaponItemMgr.destroy();
        this.enemyMgr.destroy();
        App.ticker.remove(this.onTickHandler);
        MusicMgr.pauseBGM();
    }

    onTick(delta) {
        if (!this.gameEnded) {
            this.remainEnmeyCountText.text = `剩余敌机数量：${this.enemyMgr.getRemainEnemyCount()}`;
        }

        this.world.step(1 / Config.fps);

        if (RunOption.showDebugInfo) {
            this.debugText.text = `FPS:${Math.floor(delta * Config.fps)}
虫子数量：${this.wormMgr.getWormCount()}
陨石数量：${this.meteorMgr.getMeteorCount()}
红心数量：${this.heartMgr.getHeartCount()}
持有金币：${DataMgr.get("coin", 0)}`;
        }

        if (!this.player.isDestroyed()) {
            let x = Config.designWidth / 2 - this.player.sprite.x,
                y = Config.designHeight / 2 - this.player.sprite.y;
            this.gameContainer.position.set(x, y);
        }

        if (!this.gameEnded && this.player.isDestroyed()) {
            this.gameEnded = true;
            App.showScene("GameOverScene", this.enemyMgr.getRemainEnemyCount());
        }
    }

    onPointerdown(event) {
        if (this.startPoint) {
            return;
        }

        let point = {
            x: event.data.global.x - App.scenesContainer.x,
            y: event.data.global.y - App.scenesContainer.y
        };

        let targetAngle = this.player.sprite.rotation;
        let x = point.x - Math.cos(targetAngle) * Config.rockerRadius;
        let y = point.y - Math.sin(targetAngle) * Config.rockerRadius;
        this.startPoint = {x: x, y: y};

        this.startPointCircle = new Sprite(resources[Config.imagePath.rockerBottom].texture);
        this.addChild(this.startPointCircle);
        this.startPointCircle.anchor.set(0.5, 0.5);
        this.startPointCircle.position.set(this.startPoint.x, this.startPoint.y);

        this.endPointCircle = new Sprite(resources[Config.imagePath.rocker].texture);
        this.addChild(this.endPointCircle);
        this.endPointCircle.anchor.set(0.5, 0.5);
        this.endPointCircle.position.set(point.x, point.y);
    }

    onPointermove(event) {
        if (this.startPoint) {
            let point = {
                x: event.data.global.x - App.scenesContainer.x,
                y: event.data.global.y - App.scenesContainer.y
            };
            let targetAngle = GameUtils.calcPointVectorAngle(this.startPoint, point);
            this.player.setTargetAngle(targetAngle);

            let ex = this.startPoint.x + Math.cos(targetAngle) * Config.rockerRadius,
                ey = this.startPoint.y + Math.sin(targetAngle) * Config.rockerRadius;
            this.endPointCircle.position.set(ex, ey);
        }
    }

    onPointerup() {
        this.startPoint = undefined;
        this.player.setTargetAngle(undefined);
        if (this.startPointCircle) {
            this.startPointCircle.parent.removeChild(this.startPointCircle);
            this.startPointCircle = undefined;
        }
        if (this.endPointCircle) {
            this.endPointCircle.parent.removeChild(this.endPointCircle);
            this.endPointCircle = undefined;
        }
    }

    createRemainEnemyCountText() {
        this.remainEnmeyCountText = new Text("", new TextStyle(Config.gameScene.survivalTimeText));
        this.addChild(this.remainEnmeyCountText);
    }

    createLifePanel() {
        this.lifePanel = this.addChild(new Container());
        this.lifePanel.position.set(Config.designWidth, 0);
        this.setLifeCount(1);
    }

    setLifeCount(count) {
        if (count !== this.lifeCount) {
            this.lifeCount = count;
            this.lifePanel.removeChildren();
            let texture = resources[Config.imagePath.heart].texture;
            for (let i = 0; i < this.lifeCount; i++) {
                let icon = this.lifePanel.addChild(new Sprite(texture));
                icon.anchor.set(1, 0);
                icon.position.set(-i * Config.gameScene.lifePanel.heartOffset, 0);
            }
        }
    }

    createBombPanel() {
        this.bombPanel = this.addChild(new Container());
        this.bombPanel.position.set(
            Config.designWidth - Config.gameScene.bombPanel.right,
            Config.gameScene.bombPanel.positionY);
        this.setBombCount(0);
    }

    setBombCount(count) {
        if (count !== this.bombCount) {
            this.bombCount = count;
            this.bombPanel.removeChildren();
            let texture = resources[Config.imagePath.bombIcon].texture;
            for (let i = 0; i < this.bombCount; i++) {
                let icon = this.bombPanel.addChild(new Sprite(texture));
                icon.anchor.set(1, 0);
                icon.position.set(-i * Config.gameScene.bombPanel.iconOffset, 0);
            }
        }
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

    createBullet(pos, radians, creator) {
        new Bullet(this.gameContainer, this.world, pos, radians, creator);
    }

    findNearestEnemy(self) {
        let enemyList = [this.player]
            .concat(this.enemyMgr.enemyList)
            .concat(this.wormMgr.wormList)
            .concat(this.meteorMgr.meteorList);
        Utils.removeItemFromArray(enemyList, self);
        let minDistance = undefined;
        let nearestEnemy = undefined;
        enemyList.forEach(enemy => {
            let distance = Utils.calcPointsDistance(enemy.body.getPosition(), this.player.body.getPosition());
            if (minDistance === undefined || distance < minDistance) {
                minDistance = distance;
                nearestEnemy = enemy;
            }
        });
        return nearestEnemy;
    }

    createPlayer() {
        let id = DataMgr.get("selectedPlane");
        let renderPosition = {x: Config.gameSceneWidth / 2, y: Config.gameSceneHeight / 2};
        this.player = new Player(this.world, this.gameContainer, id, renderPosition);
    }
}

GameScene.resPathList = Utils.recursiveValues(Config.imagePath);
