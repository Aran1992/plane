import {Application, Container, loader, resources} from "./libs/pixi-wrapper.js";
import GameScene from "./scenes/GameScene.js";
import GameOverScene from "./scenes/GameOverScene.js";
import Utils from "./utils/Utils";
import StartScene from "./scenes/StartScene";
import Config from "../config.js";
import MusicMgr from "./mgr/MusicMgr";

export default class MyApplication extends Application {
    constructor(args) {
        if (window.App) {
            return window.App;
        }

        super(args);

        window.App = this;

        this.scenesContainer = this.stage.addChild(new Container());
        this.scenesContainer.x = (args.width - Config.designWidth) / 2;
        this.scenesContainer.y = (args.height - Config.designHeight) / 2;
        this.sceneWidth = Config.designWidth;
        this.sceneHeight = Config.designHeight;

        this.sceneClassTable = {
            "GameScene": GameScene,
            "GameOverScene": GameOverScene,
            "StartScene": StartScene,
        };
        this.sceneTable = {};

        this.eventTable = {};

        this.listenGameRunStatus();
    }

    getScene(sceneName) {
        return this.sceneTable[sceneName];
    }

    showScene(sceneName, ...args) {
        if (this.sceneTable[sceneName] === undefined) {
            let scene = this.sceneClassTable[sceneName];
            this.sceneTable[sceneName] = new scene();
            this.scenesContainer.addChild(this.sceneTable[sceneName]);
            this.sceneTable[sceneName].create(() => {
                this.sceneTable[sceneName].show(...args);
            });
        } else {
            this.sceneTable[sceneName].show(...args);
        }
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

    listenGameRunStatus() {
        function getHiddenProp() {
            let prefixes = ["webkit", "moz", "ms", "o"];
            if ("hidden" in document) return "hidden";
            for (let i = 0; i < prefixes.length; i++) {
                if ((prefixes[i] + "Hidden") in document)
                    return prefixes[i] + "Hidden";
            }
        }

        function getVisibilityState() {
            let prefixes = ["webkit", "moz", "ms", "o"];
            if ("visibilityState" in document) return "visibilityState";
            for (let i = 0; i < prefixes.length; i++) {
                if ((prefixes[i] + "VisibilityState") in document)
                    return prefixes[i] + "VisibilityState";
            }
        }

        let visProp = getHiddenProp();
        if (visProp) {
            let evtname = visProp.replace(/[H|h]idden/, "") + "visibilitychange";
            document.addEventListener(evtname, function () {
                if (document[getVisibilityState()] === "visible") {
                    MusicMgr.onGameStart();
                } else {
                    MusicMgr.onGameStop();
                }
            }, false);
        }
    }
}
