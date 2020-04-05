import Plane from "../Plane";
import Utils from "../../utils/Utils";

interface WeaponConfig {
    readonly "id": string,
    readonly "name": string,
    readonly "initFireInterval": number,
    readonly "minFireInterval": number,
    readonly "itemReduceFireInterval": number,
    "initFireTimes": number,
    "maxFireTimes": number,
    readonly "itemAddFireTimes": number,
    readonly "fireShootTimes": number,
    readonly "fireShootInterval": number
}

interface BulletConfig {
    readonly "initBulletVelocity": number,
    readonly "maxBulletVelocity": number,
    readonly "itemAddBulletVelocity": number,
    readonly "bulletCountEachShoot": number,
    readonly "includedAngle": number,
}

export default class Weapon {
    protected plane: Plane;
    protected bulletConfig: BulletConfig;
    protected bulletVelocity: number;
    private weaponConfig: WeaponConfig;
    private remainFireTimes: number;
    private remainShootTimes: number = 0;
    private curFrame: number = -1;
    private fireFrame: number = 0;
    private shootFrame: number = 0;
    private fireInterval: number;

    constructor(weaponConfig: WeaponConfig, bulletConfig: BulletConfig, plane: Plane,) {
        this.weaponConfig = weaponConfig;
        this.bulletConfig = bulletConfig;
        [weaponConfig, bulletConfig].forEach(config => {
            Utils.keys(config).forEach(key => {
                if (config[key] === null) {
                    config[key] = Infinity;
                }
            });
        });
        this.plane = plane;
        this.fireInterval = this.weaponConfig.initFireInterval;
        this.remainFireTimes = this.weaponConfig.initFireTimes;
        this.bulletVelocity = this.bulletConfig.initBulletVelocity;
    }

    public destroy() {
    }

    public addSupply() {
        this.fireInterval -= this.weaponConfig.itemReduceFireInterval;
        if (this.fireInterval < this.weaponConfig.minFireInterval) {
            this.fireInterval = this.weaponConfig.minFireInterval;
        }
        this.bulletVelocity += this.bulletConfig.itemAddBulletVelocity;
        if (this.bulletVelocity > this.bulletConfig.maxBulletVelocity) {
            this.bulletVelocity = this.bulletConfig.maxBulletVelocity;
        }
        if (this.isStoppedFire()) {
            const minFireFrame = this.fireFrame + this.fireInterval;
            this.fireFrame = this.curFrame + 1;
            if (this.fireFrame < minFireFrame) {
                this.fireFrame = minFireFrame;
            }
        }
        this.remainFireTimes += this.weaponConfig.itemAddFireTimes;
        if (this.remainFireTimes > this.weaponConfig.maxFireTimes) {
            this.remainFireTimes = this.weaponConfig.maxFireTimes;
        }
    }

    public update() {
        this.curFrame++;
        if (this.curFrame === this.fireFrame) {
            this.fire();
        }
        if (this.curFrame === this.shootFrame) {
            this.shoot();
        }
    }

    protected onShoot() {
        this.plane.shootNearestEnemy(this.bulletConfig, this.bulletVelocity);
    }

    private isStoppedFire(): boolean {
        return this.remainFireTimes === 0 && this.remainShootTimes === 0;
    }

    private fire() {
        this.remainFireTimes--;
        if (this.remainFireTimes > 0) {
            this.fireFrame += this.fireInterval;
        }
        this.shootFrame = this.curFrame;
        this.remainShootTimes = this.weaponConfig.fireShootTimes;
    }

    private shoot() {
        this.remainShootTimes--;
        if (this.remainShootTimes > 0) {
            this.shootFrame += this.weaponConfig.fireShootInterval;
        }
        this.onShoot();
    }
}
