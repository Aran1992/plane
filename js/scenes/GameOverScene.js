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

        let gameOverText = new Text("", new TextStyle(Config.gameOverScene.gameOverText));
        this.addChild(gameOverText);
        gameOverText.anchor.set(0.5, 0.5);
        gameOverText.position.set(Config.gameOverScene.gameOverText.x, Config.gameOverScene.gameOverText.y);
        this.gameOverText = gameOverText;

        this.createButton(
            Config.imagePath.restartButton,
            Config.gameOverScene.restartButton.position.x,
            Config.gameOverScene.restartButton.position.y,
            this.onClickRestart.bind(this)
        );
        this.createButton(
            Config.imagePath.mainButton,
            Config.gameOverScene.mainButton.position.x,
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

    onShow(remainEnemyCount) {
        this.gameOverText.text = `本次排名\n${remainEnemyCount + 1}`;
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
        if (window.PlatformHelper.share) {
            window.PlatformHelper.share();
        }
    }

    onClickAd() {
    }
}
