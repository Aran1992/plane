import Scene from "../base/Scene";
import {AnimatedSprite, Container, resources, Sprite} from "../libs/pixi-wrapper";
import Config from "../../config";
import Utils from "../utils/Utils";
import Background from "../npc/Background";
import MyWorld from "../MyWorld";
import {Vec2} from "../libs/planck-wrapper";

export default class StartScene extends Scene {
    onCreate() {
        this.world = new MyWorld({gravity: Vec2(0, Config.gravity)});

        this.gameContainer = new Container();
        this.addChild(this.gameContainer);

        this.background = new Background(this.world, this.gameContainer);

        this.player = new AnimatedSprite(Config.imagePath.rocket.map(path => resources[path].texture));
        this.player.animationSpeed = 1 / Config.frameInterval;
        this.gameContainer.addChild(this.player);
        this.player.anchor.set(0.5, 0.5);

        this.wormList = [];

        this.title = new Sprite(resources[Config.imagePath.title].texture);
        this.addChild(this.title);
        this.title.anchor.set(0.5, 0);
        this.title.position.set(App.sceneWidth / 2, Config.startScene.title.position.y);

        this.startButton = new Sprite(resources[Config.imagePath.startButton].texture);
        this.addChild(this.startButton);
        this.startButton.anchor.set(0.5, 0.5);
        this.startButton.position.set(App.sceneWidth / 2, App.sceneHeight / 2);
        this.onClick(this.startButton, this.onClickStartButton.bind(this));
    }

    onShow() {
        this.onTickHandler = this.onTick.bind(this);
        App.ticker.add(this.onTickHandler);

        this.gameContainer.position.set(
            Math.random() * (Config.designWidth - Config.gameSceneWidth),
            Math.random() * (Config.designHeight - Config.gameSceneHeight),
        );

        this.player.play();
        this.wormList.forEach(worm => worm.play());

        this.restartPlayer();
    }

    onHide() {
        App.ticker.remove(this.onTickHandler);

        this.player.stop();
        this.wormList.forEach(worm => worm.stop());
    }

    onClickStartButton() {
        App.hideScene("StartScene");
        App.showScene("GameScene");
    }

    onTick() {
        this.world.step(1 / Config.fps);
        this.player.x += this.player.velocity;
        if ((this.player.velocity > 0 && this.player.x - this.player.totalWidth > Config.gameSceneWidth)
            || (this.player.velocity < 0 && this.player.x + this.player.totalWidth < 0)) {
            this.restartPlayer();
        }
    }

    restartPlayer() {
        let x, velocity, rotation;
        if (Math.random() < 0.5) {
            x = -this.player.width;
            velocity = Config.startScene.player.velocity;
            rotation = 0;
        } else {
            x = Config.gameSceneWidth + this.player.width;
            velocity = -Config.startScene.player.velocity;
            rotation = Math.PI;
        }
        let y = -this.gameContainer.y + Math.random() * Config.designHeight;
        this.player.position.set(x, y);
        this.player.velocity = velocity;
        this.player.rotation = rotation;

        this.wormList.forEach(worm => worm.destroy());
        this.wormList = [];
        let wormCount = Utils.randomIntInRange(Config.startScene.worm.minCount, Config.startScene.worm.maxCount);
        let maxWormX = 0;
        for (let i = 0; i < wormCount; i++) {
            let textures = Config.imagePath.worm.map(path => resources[path].texture);
            let random = Utils.randomIntInRange(0, textures.length);
            textures = textures.concat(textures.splice(0, random));
            let worm = new AnimatedSprite(textures);
            this.player.addChild(worm);
            worm.animationSpeed = 1 / Config.frameInterval;
            worm.anchor.set(0.5, 0.5);
            let y = Utils.randomInRange(-Config.startScene.worm.halfYRange, Config.startScene.worm.halfYRange);
            let x = -Utils.randomInRange(200, 500);
            worm.position.set(x, y);
            if (x < maxWormX) {
                maxWormX = x;
            }
            worm.play();
            this.wormList.push(worm);
        }
        this.player.totalWidth = -maxWormX + resources[Config.imagePath.worm[0]].texture.width;
    }
}

StartScene.resPathList = Utils.recursiveValues(Config.imagePath);
