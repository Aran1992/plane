import Scene from "../base/Scene.js";
import {Graphics, Text, TextStyle} from "../libs/pixi-wrapper.js";
import Config from "../../config.js";

export default class GameOverScene extends Scene {
    onCreate() {
        let mask = new Graphics();
        this.addChild(mask);
        mask.beginFill(0x000000, 0.5);
        mask.drawRect(0, 0, Config.designWidth, Config.designHeight);
        mask.endFill();
        mask.interactive = true;

        let textStyle = new TextStyle({fontSize: 100, fill: 0xff0000});
        let gameOverText = new Text("游戏结束!", textStyle);
        this.addChild(gameOverText);
        gameOverText.anchor.set(0.5, 0.5);
        gameOverText.position.set(Config.designWidth / 2, Config.designHeight / 9 * 3);
        this.gameOverText = gameOverText;

        this.createButton(
            Config.imagePath.restartButton,
            App.sceneWidth / 2,
            Config.gameOverScene.restartButton.position.y,
            this.onClickRestart.bind(this)
        );
        this.createButton(
            Config.imagePath.mainButton,
            App.sceneWidth / 2,
            Config.gameOverScene.mainButton.position.y,
            this.onClickMain.bind(this)
        );
        this.createButton(
            Config.imagePath.adButton,
            Config.gameOverScene.adButton.position.x,
            Config.gameOverScene.adButton.position.y,
            this.onClickAd.bind(this)
        );
        this.createButton(
            Config.imagePath.shareButton,
            Config.gameOverScene.shareButton.position.x,
            Config.gameOverScene.shareButton.position.y,
            this.onClickShare.bind(this)
        );
    }

    onShow(survivalTime) {
        this.gameOverText.text = `游戏结束，生存时间为：${Math.floor(survivalTime / Config.fps * 100) / 100}秒`;
    }

    onClickRestart() {
        App.hideScene("GameOverScene");
        App.dispatchEvent("Restart");
    }

    onClickMain() {
        App.hideScene("GameOverScene");
        App.hideScene("GameScene");
        App.showScene("StartScene");
    }

    onClickShare() {
    }

    onClickAd() {
    }
}
