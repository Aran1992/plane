import "./js/libs/weapp-adapter.js";
import main from "./js/main.js";

wx.showShareMenu();

const shareInfo = {
    title: "像素飞船大！作！战！",
    imageUrl: "images/share-content.png"
};

wx.onShareAppMessage(() => shareInfo);

window.PlatformHelper = {
    share: () => wx.shareAppMessage(shareInfo)
};

main();

let pixelRatio = App.view.width / window.innerWidth;

App.renderer.plugins.interaction.mapPositionToPoint = (point, x, y) => {
    point.x = x * pixelRatio;
    point.y = y * pixelRatio;
};
