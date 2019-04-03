import "./js/libs/weapp-adapter.js";
import MyApplication from "./js/MyApplication.js";
import config from "./config.js";

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

let app = new MyApplication({
    backgroundColor: config.backgroundColor,
    width: width,
    height: height,
    antialias: true,
    transparent: false,
    view: canvas
});

let pixelRatio = width / window.innerWidth;
app.renderer.plugins.interaction.mapPositionToPoint = (point, x, y) => {
    point.x = x * pixelRatio;
    point.y = y * pixelRatio;
};

App.showScene("StartScene");
