import MyApplication from "./MyApplication.js";
import Config from "../config.js";

document.body.style.margin = "0";

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
    resolution: window.innerWidth / width,
    antialias: true,
    transparent: false,
});
document.body.appendChild(App.view);

App.showScene("StartScene");
