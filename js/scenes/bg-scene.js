import Scene from "../base/scene.js"
import {Container, resources, Sprite} from "../libs/pixi-wrapper.js"
import {app} from "../my-application.js"

const path = {
    bg: "images/bg.png",
    cloud1: "images/cloud-1.png",
    cloud2: "images/cloud-2.png",
    cloud3: "images/cloud-3.png",
    terrain1: "images/terrain-1.png",
    terrain2: "images/terrain-2.png",
    terrain3: "images/terrain-3.png",
    star: "images/star.png",
};

export default class BgScene extends Scene {
    onCreate() {
        let list = [];
        for (let name in path) {
            list.push(path[name]);
        }
        app.loadResources(list, this.onLoaded.bind(this));
    }

    onLoaded() {
        let gameContainer = new Container();
        this.addChild(gameContainer);
        gameContainer.scale.set(0.5, 0.5);

        let bg = new Sprite(resources[path.bg].texture);
        gameContainer.addChild(bg);
        bg.scale.set(2, 2);

    }
}
