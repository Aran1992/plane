import MyApplication from "./my-application.js"
import config from "../config.js"

document.body.style.margin = "0";

let resolution;
let wwhRatio = window.innerWidth / window.innerHeight;
let dwhRatio = config.designWidth / config.designHeight;
if (wwhRatio < dwhRatio) {
    resolution = window.innerWidth / config.designWidth;
} else {
    resolution = window.innerHeight / config.designHeight
}

let app = new MyApplication({
    backgroundColor: config.backgroundColor,
    width: config.designWidth,
    height: config.designHeight,
    resolution: resolution,
    antialiasing: true,
    transparent: false,
});
document.body.appendChild(app.view);

app.view.style.position = "absolute";
app.view.style.left = (window.innerWidth - app.view.offsetWidth) / 2 + "px";
app.view.style.top = (window.innerHeight - app.view.offsetHeight) / 2 + "px";

app.showScene("GameScene");