import {Application, loader, resources} from "./libs/pixi-wrapper.js";
import GameScene from "./scenes/game-scene.js";
import GameOverScene from "./scenes/game-over-scene.js";

export default class MyApplication extends Application {
    constructor(args) {
        if (window.app) {
            return window.app;
        }

        super(args);

        window.app = this;

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
