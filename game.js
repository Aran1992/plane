import "./js/libs/weapp-adapter.js";
import MyApplication from "./js/MyApplication.js";
import Config from "./config.js";

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

let app = new MyApplication({
    backgroundColor: Config.backgroundColor,
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

app.view.style.position = "absolute";
app.view.style.left = (window.innerWidth - app.view.offsetWidth) / 2 + "px";
app.view.style.top = (window.innerHeight - app.view.offsetHeight) / 2 + "px";

app.showScene("StartScene");
