import {Application, loader, resources} from "./libs/pixi-wrapper.js";
import GameScene from "./scenes/GameScene.js";
import GameOverScene from "./scenes/GameOverScene.js";
import Utils from "./utils/Utils";

export default class MyApplication extends Application {
    constructor(args) {
        if (window.App) {
            return window.App;
        }

        super(args);

        window.App = this;

        this.scenesContainer = this.stage;
        this.sceneWidth = args.width;
        this.sceneHeight = args.height;

        this.sceneClassTable = {
            "GameScene": GameScene,
            "GameOverScene": GameOverScene,
        };
        this.sceneTable = {};

        this.eventTable = {};
    }

    getScene(sceneName) {
        return this.sceneTable[sceneName];
    }

    showScene(sceneName, ...args) {
        if (this.sceneTable[sceneName] === undefined) {
            let scene = this.sceneClassTable[sceneName];
            this.sceneTable[sceneName] = new scene();
            this.scenesContainer.addChild(this.sceneTable[sceneName]);
        }
        this.sceneTable[sceneName].show(...args);
    }

    hideScene(sceneName) {
        if (this.sceneTable[sceneName]) {
            this.sceneTable[sceneName].hide();
        }
    }

    dispatchEvent(event, ...args) {
        if (this.eventTable[event]) {
            this.eventTable[event].forEach(handler => handler(...args));
        }
    }

    registerEvent(event, handler) {
        if (this.eventTable[event] === undefined) {
            this.eventTable[event] = [];
        }
        this.eventTable[event].push(handler);
    }

    unregisterEvent(event, handler) {
        if (this.eventTable[event]) {
            Utils.removeItemFromArray(this.eventTable[event], handler);
        }
    }

    loadResources(resPathList, loadedCallback) {
        resPathList = Array.from(new Set(resPathList));
        resPathList = resPathList.filter(path => resources[path] === undefined);
        loader.add(resPathList).load(loadedCallback);
    }
}
