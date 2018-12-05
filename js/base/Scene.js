import {Container} from "../libs/pixi-wrapper.js";

export default class Scene extends Container {
    constructor() {
        super();
        this.onCreate();
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
}