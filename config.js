export default {
    designWidth: 1920,
    designHeight: 1080,
    backgroundColor: 0x888888,
    fps: 60,
    gravity: 0,
    bgImagePath: "images/bg.png",
    pixel2meter: 0.0625,
    meter2pixel: 16,
    planeImagePath: "images/rocket.png",
    planeRadius: 2.65625,
    // 飞机的速度
    planeVelocity: 30,
    // 飞机的推进力
    planeEngineForce: 10,
    // 飞机旋转的速度
    planeAngularVelocity: Math.PI / 180 * 5,
    // 虫子跟随飞机的位置是飞机几帧前的
    planePastPosLength: 5,
    meteorImagePath: "images/meteorite.png",
    meteorRadius: 1.71875,
    // 陨石生成时的最小速度
    meteorMinVelocity: 10,
    // 陨石生成时的最大速度
    meteorMaxVelocity: 20,
    // 初始化时生成陨石的最小数量
    meteorMinCount: 1,
    // 初始化时生成陨石的最大数量
    meteorMaxCount: 2,
    // 陨石的弹性系数（0到1，数字越大，弹性越大）
    meteorRestitution: 1,
    // 陨石的旋转速度
    meteorAngularVelocity: Math.PI / 180 * 5,
    // 每帧刷新陨石的可能性(0.01表示百分之一，0.5表示百分之五十)
    refreshMeteorProbability: 0.01,
    // 每帧刷新陨石的最小数量
    refreshMeteorMinCount: 1,
    // 每帧刷新陨石的最大数量
    refreshMeteorMaxCount: 2,
    // 陨石同时能存在的最大数量
    meteorExistMaxCount: 10,
    wormImagePath: "images/worm.png",
    // 虫子的旋转速度
    wormAngularVelocity: Math.PI / 180 * 5,
    // 虫子的速度
    wormVelocity: 10,
    // 虫子的推进力
    wormEngineForce: 10,
    // 初始化时生成虫子的最小数量
    wormMinCount: 1,
    // 初始化时生成虫子的最大数量
    wormMaxCount: 2,
    // 虫子同时能存在的最大数量
    wormExistMaxCount: 2,
    // 每帧刷新虫子的可能性(0.01表示百分之一，0.5表示百分之五十)
    refreshWormProbability: 0.1,
};
