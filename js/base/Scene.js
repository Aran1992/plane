import {Container} from "../libs/pixi-wrapper.js";
import {resources, Sprite} from "../libs/pixi-wrapper";

export default class Scene extends Container {
    create(createCallback) {
        this.loadResources(() => {
            this.onCreate();
            createCallback();
        });
    }

    destroy() {
        this.onDestroy();
        this.parent.removeChild(this);
    }

    show(...args) {
        this.visible = true;
        this.onShow(...args);
    }

    hide() {
        this.visible = false;
        this.onHide();
    }

    onCreate() {
    }

    onDestroy() {
    }

    onShow() {
    }

    onHide() {
    }

    loadResources(callback) {
        if (this.__proto__.constructor.resPathList) {
            App.loadResources(this.__proto__.constructor.resPathList, callback);
        } else {
            callback();
        }
    }

    onClick(button, handler) {
        button.buttonMode = true;
        button.interactive = true;
        button.on("pointerup", (event) => handler(button, event));
    }

    createButton(path, x, y, handler) {
        let button = new Sprite(resources[path].texture);
        this.addChild(button);
        button.anchor.set(0.5, 0.5);
        button.position.set(x, y);
        this.onClick(button, handler);
        return button;
    }
}
