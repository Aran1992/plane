interface WeaponConfig {
    readonly maxKeepFireTimes: number;
    readonly fireInterval: number;
    readonly shootInterval: number;
    readonly shootTimesEachFire: number;
}

export default class Weapon {
    private config: WeaponConfig;
    private remainFireTimes: number;
    private remainShootTimes: number;
    private curFrame: number;
    private fireFrame: number;
    private shootFrame: number;

    constructor(config: WeaponConfig) {
        this.config = config;
    }

    private get isStoppedFire(): boolean {
        return this.remainFireTimes === 0 && this.remainShootTimes === 0;
    }

    public addSupply(addTimes: number) {
        this.remainFireTimes += addTimes;
        if (this.remainFireTimes > this.config.maxKeepFireTimes) {
            this.remainFireTimes = this.config.maxKeepFireTimes;
        }
        if (this.isStoppedFire) {
            const a = this.fireFrame + this.config.fireInterval;
            const b = this.curFrame + 1;
            this.fireFrame = a > b ? a : b;
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

    private fire() {
        this.remainFireTimes--;
        if (this.remainFireTimes > 0) {
            this.fireFrame += this.config.fireInterval;
        }
        this.shootFrame = this.curFrame;
        this.remainShootTimes = this.config.shootTimesEachFire;
    }

    private shoot() {
        this.remainShootTimes--;
        if (this.remainShootTimes > 0) {
            this.shootFrame += this.config.shootInterval;
        }
    }
}