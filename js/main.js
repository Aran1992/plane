import MyApplication from "./MyApplication.js";
import Config from "../config.js";
import config from "../config";

document.body.style.margin = "0";

let width;
let height;
let designSizeWHRatio = config.designWidth / config.designHeight;
let windowSizeWHRatio = window.innerWidth / window.innerHeight;
if (designSizeWHRatio > windowSizeWHRatio) {
    width = config.designWidth;
    height = config.designWidth / windowSizeWHRatio;
} else {
    width = config.designHeight * windowSizeWHRatio;
    height = config.designHeight;
}

let App = new MyApplication({
    backgroundColor: Config.backgroundColor,
    width: width,
    height: height,
    antialias: true,
    transparent: false,
});
document.body.appendChild(App.view);

App.view.style.width = "100%";
App.view.style.height = "100%";

App.showScene("StartScene");
