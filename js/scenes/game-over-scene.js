import Scene from "../base/scene.js"
import {Graphics, Text, TextStyle} from "../libs/pixi-wrapper.js"
import config from "../../config.js"

export default class GameOverScene extends Scene {
    onCreate() {
        let mask = new Graphics();
        this.addChild(mask);
        mask.beginFill(0x000000, 0.5);
        mask.drawRect(0, 0, config.designWidth, config.designHeight);
        mask.endFill();
        mask.interactive = true;

        let textStyle = new TextStyle({fontSize: 100, fill: 0xff0000});
        let gameOverText = new Text("游戏结束!", textStyle);
        this.addChild(gameOverText);
        gameOverText.anchor.set(0.5, 0.5);
        gameOverText.position.set(config.designWidth / 2, config.designHeight / 9 * 3);
        this.gameOverText = gameOverText;

        textStyle = new TextStyle({fontSize: 100, fill: 0x0000ff});
        let restartText = new Text("重新开始", textStyle);
        this.addChild(restartText);
        restartText.anchor.set(0.5, 0.5);
        restartText.position.set(config.designWidth / 2, config.designHeight / 9 * 6);
        restartText.interactive = true;
        restartText.buttonMode = true;
        restartText.on("pointerdown", this.onClickRestartText.bind(this));
    }

    onShow(survivalTime) {
        this.gameOverText.text = `游戏结束，生存时间为：${Math.floor(survivalTime / config.fps * 100) / 100}秒`;
    }

    onClickRestartText() {
        app.hideScene("GameOverScene");
        app.dispatchEvent("Restart");
    }
}
