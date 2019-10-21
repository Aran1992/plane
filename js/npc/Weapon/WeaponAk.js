import Config from "../../../config";
import Utils from "../../utils/Utils";

export default class WeaponAK {
    constructor(gameScene, plane) {
        this.gameScene = gameScene;
        this.plane = plane;
        this.config = Config.weapon.AK;
        this.remainShootCount = 0;
        this.remainBulletShootCount = 0;
        this.nextShootTime = Infinity;
        this.nextBulletShootTime = Infinity;
    }

    addSupply() {
        this.remainShootCount += this.config.addedShootTimesEachSupply;
        if (this.remainShootCount > this.config.upperLimitRemainShootTimes) {
            this.remainShootCount = this.config.upperLimitRemainShootTimes;
        }
        if (this.nextBulletShootTime === Infinity && this.nextShootTime === Infinity) {
            this.nextShootTime = this.gameScene.time + this.config.shootInterval;
        }
    }

    update() {
        if (this.nextBulletShootTime === Infinity && this.gameScene.time >= this.nextShootTime) {
            this.nextBulletShootTime = this.gameScene.time;
            this.remainBulletShootCount = this.config.bulletCountEachShoot;
            this.remainShootCount--;
        }
        if (this.gameScene.time >= this.nextBulletShootTime) {
            this.shootBullet();
            this.remainBulletShootCount--;
            if (this.remainBulletShootCount === 0) {
                this.nextBulletShootTime = Infinity;
                if (this.remainShootCount > 0) {
                    this.nextShootTime = this.gameScene.time + this.config.shootInterval;
                } else {
                    this.nextShootTime = Infinity;
                }
            } else {
                this.nextBulletShootTime += this.config.bulletShootInterval;
            }
        }
    }

    shootBullet() {
        let bulletConfig = Utils.copyProperty(Utils.copy(Config.bullet.default), Config.bullet.AK);
        this.plane.shootNearestEnemy(bulletConfig);
    }

    destroy() {
    }
}
