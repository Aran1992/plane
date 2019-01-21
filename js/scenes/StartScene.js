import Scene from "../base/Scene";
import {AnimatedSprite, Container, resources, Sprite, Text, TextStyle} from "../libs/pixi-wrapper";
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

        this.createStartLayer();

        this.createSelectLayer();
    }

    createStartLayer() {
        this.startLayer = this.addChild(new Container());

        this.title = this.startLayer.addChild(new Sprite(resources[Config.imagePath.title].texture));
        this.title.anchor.set(0.5, 0);
        this.title.position.set(App.sceneWidth / 2, Config.startScene.title.position.y);

        this.startButton = this.startLayer.addChild(new Sprite(resources[Config.imagePath.startButton].texture));
        this.startButton.anchor.set(0.5, 0.5);
        this.startButton.position.set(App.sceneWidth / 2, App.sceneHeight / 2);
        this.onClick(this.startButton, this.onClickStartButton.bind(this));
    }

    createSelectLayer() {
        this.selectLayer = this.addChild(new Container());

        this.nameText = this.selectLayer.addChild(new Text("SelectPlaneName", new TextStyle(Config.startScene.nameText)));
        this.nameText.anchor.set(0.5, 0.5);
        this.nameText.position.set(App.sceneWidth / 2, App.sceneHeight / 2 - Config.startScene.nameText.offset);

        this.countText = this.selectLayer.addChild(new Text("1/2", new TextStyle(Config.startScene.countText)));
        this.countText.anchor.set(0.5, 0.5);
        this.countText.position.set(App.sceneWidth / 2, App.sceneHeight / 2 - Config.startScene.countText.offset);

        this.plane = this.selectLayer.addChild(new Sprite());
        this.plane.texture = resources[Config.imagePath.rocket[0]].texture;
        this.plane.anchor.set(0.5, 0.5);
        this.plane.position.set(App.sceneWidth / 2, App.sceneHeight / 2);
        this.onClick(this.plane, this.onClickPlane.bind(this));

        this.leftButton = this.selectLayer.addChild(new Sprite(resources[Config.imagePath.leftButton].texture));
        this.leftButton.anchor.set(0.5, 0.5);
        this.leftButton.position.set(App.sceneWidth / 2 - Config.startScene.toggleButton.offset, App.sceneHeight / 2);
        this.onClick(this.leftButton, this.onClickLeftButton.bind(this));

        this.rightButton = this.selectLayer.addChild(new Sprite(resources[Config.imagePath.leftButton].texture));
        this.rightButton.anchor.set(0.5, 0.5);
        this.rightButton.rotation = Math.PI;
        this.rightButton.position.set(App.sceneWidth / 2 + Config.startScene.toggleButton.offset, App.sceneHeight / 2);
        this.onClick(this.rightButton, this.onClickRightButton.bind(this));
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

        this.startLayer.visible = true;
        this.selectLayer.visible = false;
    }

    onHide() {
        App.ticker.remove(this.onTickHandler);

        this.player.stop();
        this.wormList.forEach(worm => worm.stop());
    }

    onClickStartButton() {
        this.startLayer.visible = false;
        this.selectLayer.visible = true;
        this.updateSelectedPlane(0);
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
            let x = -Utils.randomInRange(Config.startScene.worm.minX, Config.startScene.worm.maxX);
            worm.position.set(x, y);
            if (x < maxWormX) {
                maxWormX = x;
            }
            worm.play();
            this.wormList.push(worm);
        }
        this.player.totalWidth = -maxWormX + resources[Config.imagePath.worm[0]].texture.width;
    }

    onClickLeftButton() {
        this.updateSelectedPlane(this.index - 1);
    }

    onClickRightButton() {
        this.updateSelectedPlane(this.index + 1);
    }

    updateSelectedPlane(index) {
        if (Config.planeList[index]) {
            this.index = index;
            let config = Config.planeList[this.index];
            this.nameText.text = config.name;
            this.countText.text = `${this.index + 1}/${Config.planeList.length}`;
            this.plane.texture = resources[Config.imagePath[config.code][0]].texture;
        }
    }

    onClickPlane() {
        App.hideScene("StartScene");
        App.showScene("GameScene");
    }
}


StartScene.resPathList = Utils.recursiveValues(Config.imagePath);
