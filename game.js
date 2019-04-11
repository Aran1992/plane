import "./js/libs/weapp-adapter.js";
import main from "./js/main.js";

main();

let pixelRatio = App.view.width / window.innerWidth;

App.renderer.plugins.interaction.mapPositionToPoint = (point, x, y) => {
    point.x = x * pixelRatio;
    point.y = y * pixelRatio;
};
