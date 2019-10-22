import Config from "../../../config";

export default class WeaponDefault {
    constructor(gameScene, plane) {
        this.plane = plane;
        this.bulletCreateInterval = Config.weapon.default.createInterval;
        this.bulletCount = 0;
    }

    addSupply() {
        this.bulletCreateInterval -= Config.weaponItem.reduceBulletCreateInterval;
        if (this.bulletCreateInterval < Config.weapon.default.minCreateInterval) {
            this.bulletCreateInterval = Config.weapon.default.minCreateInterval;
        }
    }

    update() {
        this.bulletCount++;
        if (this.bulletCount / Config.fps > this.bulletCreateInterval) {
            this.bulletCount = 0;
            this.plane.shootNearestEnemy(Config.bullet.default);
        }
    }

    destroy() {
    }
}

