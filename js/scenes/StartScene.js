import Scene from "../base/Scene";
import {resources, Sprite} from "../libs/pixi-wrapper";
import Config from "../../config";
import Utils from "../utils/Utils";
import Background from "../npc/Background";
import MyWorld from "../MyWorld";
import {Vec2} from "../libs/planck-wrapper";

export default class StartScene extends Scene {
    onCreate() {
        this.world = new MyWorld({gravity: Vec2(0, Config.gravity)});
        this.background = new Background(this.world, this);
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
    }

    onHide() {
        App.ticker.remove(this.onTickHandler);
    }

    onClickStartButton() {
        App.hideScene("StartScene");
        App.showScene("GameScene");
    }

    onTick() {
        this.world.step(1 / Config.fps);
    }
}

StartScene.resPathList = Utils.recursiveValues(Config.imagePath);
