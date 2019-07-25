import Config from "../../config";
import Enemy from "../npc/Enemy";
import GameUtils from "../utils/GameUtils";
import Utils from "../utils/Utils";
import Manager from "../base/Manager";

export default class EnemyMgr extends Manager {
    onCreate(world, gameContainer) {
        this.world = world;
        this.gameContainer = gameContainer;

        this.enemyList = [];
        for (let i = Config.enemy.maxCountInBattlefield; i > 0; i--) {
            this.createEnemy();
        }
        this.createdEnemyCount = Config.enemy.maxCountInBattlefield;
        this.registerEvent("EnemyContacted", this.onEnemyDestroyed);
    }

    onEnemyDestroyed() {
        if (this.createdEnemyCount < Config.enemy.totalCount) {
            this.createdEnemyCount++;
            this.createEnemy();
        }
        if (this.enemyList.length === 0) {
            // todo 你获得了游戏胜利 显示游戏结束画面
        }
    }

    onDestroy() {
        this.enemyList.forEach(enemy => enemy.destroy());
    }

    removeChild(child) {
        Utils.removeItemFromArray(this.enemyList, child);
    }

    createEnemy() {
        let renderPosition = {
            x: GameUtils.randomInRange([0, Config.gameSceneWidth]),
            y: GameUtils.randomInRange([0, Config.gameSceneHeight]),
        };
        let id = Utils.randomChoose(Config.planeList).id;
        this.enemyList.push(new Enemy(this, this.world, this.gameContainer, id, renderPosition));
    }

    getRemainEnemyCount() {
        return Config.enemy.totalCount - this.createdEnemyCount + this.enemyList.length;
    }
}
