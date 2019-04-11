import MyApplication from "./MyApplication.js";
import Config from "../config.js";

export default function main() {
    let width;
    let height;
    let wwhRatio = window.innerWidth / window.innerHeight;
    let dwhRatio = Config.designWidth / Config.designHeight;
    if (wwhRatio > dwhRatio) {
        height = Config.designHeight;
        width = height * wwhRatio;
    } else {
        width = Config.designWidth;
        height = width / wwhRatio;
    }

    let App = new MyApplication({
        backgroundColor: Config.backgroundColor,
        width: width,
        height: height,
        antialias: true,
        transparent: false,
        view: canvas,
    });

    App.showScene("StartScene");
}
