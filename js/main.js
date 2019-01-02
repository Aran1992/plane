import MyApplication from "./MyApplication.js";
import Config from "../config.js";

document.body.style.margin = "0";

let resolution;
let wwhRatio = window.innerWidth / window.innerHeight;
let dwhRatio = Config.designWidth / Config.designHeight;
if (wwhRatio < dwhRatio) {
    resolution = window.innerWidth / Config.designWidth;
} else {
    resolution = window.innerHeight / Config.designHeight;
}

let App = new MyApplication({
    backgroundColor: Config.backgroundColor,
    width: Config.designWidth,
    height: Config.designHeight,
    resolution: resolution,
    antialiasing: true,
    transparent: false,
});
document.body.appendChild(App.view);

App.view.style.position = "absolute";
App.view.style.left = (window.innerWidth - App.view.offsetWidth) / 2 + "px";
App.view.style.top = (window.innerHeight - App.view.offsetHeight) / 2 + "px";

App.showScene("StartScene");
