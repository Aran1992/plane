﻿export default {
    designWidth: 1920,
    designHeight: 1080,
    gameSceneWidth: 1920 * 2,
    gameSceneHeight: 1080 * 2,
    backgroundColor: 0x888888,
    fps: 60,
    gravity: 0,
    pixel2meter: 0.0625,
    meter2pixel: 16,
    // 飞机船体的像素长度
    planePixelLength: 17,
    // 飞机的速度
    planeVelocity: 30,
    // 飞机的推进力
    planeEngineForce: 19,
    // 飞机旋转的速度
    planeAngularVelocity: Math.PI / 180 * 4,
    // 虫子跟随飞机的位置是飞机几帧前的
    planePastPosLength: 15,
    // 陨石物理半径
    meteorRadius: 1.71875,
    // 陨石生成时的最小速度
    meteorMinVelocity: 6,
    // 陨石生成时的最大速度
    meteorMaxVelocity: 15,
    // 初始化时生成陨石的最小数量
    meteorMinCount: 1,
    // 初始化时生成陨石的最大数量
    meteorMaxCount: 10,
    // 陨石的弹性系数（0到1，数字越大，弹性越大）
    meteorRestitution: 1,
    // 陨石的旋转速度
    meteorAngularVelocity: Math.PI / 180 * 65,
    // 每帧刷新陨石的可能性(0.01表示百分之一，0.5表示百分之五十)
    refreshMeteorProbability: 0.05,
    // 每帧刷新陨石的最小数量
    refreshMeteorMinCount: 1,
    // 每帧刷新陨石的最大数量
    refreshMeteorMaxCount: 2,
    // 陨石同时能存在的最大数量
    meteorExistMaxCount: 60,
    // 虫子的旋转速度
    wormAngularVelocity: Math.PI / 180 * 6,
    // 虫子的速度
    wormVelocity: 17,
    // 虫子的推进力
    wormEngineForce: 9,
    // 初始化时生成虫子的最小数量
    wormMinCount: 1,
    // 初始化时生成虫子的最大数量
    wormMaxCount: 2,
    // 虫子同时能存在的最大数量
    wormExistMaxCount: 5,
    // 每帧刷新虫子的可能性(0.01表示百分之一，0.5表示百分之五十)
    refreshWormProbability: 0.15,
    // 世界边缘
    worldViewRectMargin: 200,
    // 飞机无敌闪烁间隔帧数
    planeInvincibleTwinkleInterval: 8,
    // 飞机无敌闪烁透明度（0-1）
    planeInvincibleAlpha: 0.5,
    // 飞机无敌帧数
    planeInvincibleFrame: 60,
    // 飞机变大配置，有几项就能变大几次，变大系数是按照元素像素来的
    planeScaleList: [5, 6, 7, 8, 9, 10, 11],
    // 虫子爆炸掉落红心概率
    wormDropHeartProbability: 1,
    imagePath: {
        cloud1: "images/cloud-1.png",
        cloud2: "images/cloud-2.png",
        cloud3: "images/cloud-3.png",
        terrain1: "images/terrain-1.png",
        terrain2: "images/terrain-2.png",
        terrain3: "images/terrain-3.png",
        star: "images/star.png",
        bg: "images/bg.png",
        originPlane: [
            "images/rocket-1.png",
            "images/rocket-2.png",
            "images/rocket-3.png",
            "images/rocket-4.png",
        ],
        meteor: "images/meteorite.png",
        worm: [
            "images/worm-1.png",
            "images/worm-2.png",
            "images/worm-3.png",
        ],
        heart: "images/red-heart.png",
        item: "images/electric-saw.png",
        electricSaw: "images/electric-saw.png",
    },
    // 电锯相关配置
    electricSaw: {
        // 电锯密度（越大越重）
        density: 1,
        // 可以进行几次碰撞
        collideTimes: 6,
        // 距离飞船的距离
        distance: 200,
        // 距离飞船的距离
        angularVelocity: Math.PI / 180 * 10,
        // 同时能存在的最大数量
        maxCount: 5,
    },
    // 刷新道具的时间间隔
    refreshItemInterval: 5,
    // 每动画帧占用多少游戏帧
    frameInterval: 5,
    bgJson: [
        {
            "x": 977,
            "y": 519,
            "texture": "images/cloud-1.png"
        },
        {
            "x": 751,
            "y": 1263,
            "texture": "images/cloud-2.png"
        },
        {
            "x": 533,
            "y": 160,
            "texture": "images/cloud-3.png"
        },
        {
            "x": 1624,
            "y": 1087,
            "texture": "images/star.png"
        },
        {
            "x": 2206,
            "y": 128.5,
            "texture": "images/terrain-1.png"
        },
        {
            "x": 2814,
            "y": 879.5,
            "texture": "images/terrain-2.png"
        },
        {
            "x": 2941.5,
            "y": 360,
            "texture": "images/terrain-3.png"
        },
        {
            "x": 1085,
            "y": 1552.5,
            "texture": "images/terrain-3.png"
        },
        {
            "x": 463,
            "y": 734,
            "texture": "images/terrain-3.png"
        },
        {
            "x": 234,
            "y": 251,
            "texture": "images/terrain-2.png"
        },
        {
            "x": 1470,
            "y": 1393,
            "texture": "images/terrain-1.png"
        },
        {
            "x": 2738,
            "y": 1400,
            "texture": "images/terrain-3.png"
        },
        {
            "x": 271,
            "y": 1218,
            "texture": "images/terrain-2.png"
        },
        {
            "x": 3605,
            "y": 922,
            "texture": "images/terrain-1.png"
        },
        {
            "x": 2301,
            "y": 1836,
            "texture": "images/terrain-2.png"
        },
        {
            "x": 3319,
            "y": 1936,
            "texture": "images/terrain-1.png"
        },
        {
            "x": 1470,
            "y": 468.5,
            "texture": "images/terrain-2.png"
        },
        {
            "x": 995,
            "y": 1975,
            "texture": "images/cloud-3.png"
        },
        {
            "x": 3194,
            "y": 1585,
            "texture": "images/cloud-3.png"
        },
        {
            "x": 2411,
            "y": 886.5,
            "texture": "images/cloud-3.png"
        },
        {
            "x": 3005,
            "y": 1975,
            "texture": "images/cloud-2.png"
        },
        {
            "x": 3202,
            "y": 86,
            "texture": "images/cloud-3.png"
        },
        {
            "x": 1865.5,
            "y": 73.5,
            "texture": "images/cloud-1.png"
        },
        {
            "x": 2794,
            "y": 1263,
            "texture": "images/cloud-2.png"
        },
        {
            "x": 1775.5,
            "y": 1610,
            "texture": "images/cloud-2.png"
        },
        {
            "x": 1435,
            "y": 902,
            "texture": "images/cloud-2.png"
        },
        {
            "x": 2536,
            "y": 1690.5,
            "texture": "images/cloud-3.png"
        },
        {
            "x": 2731,
            "y": 448.5,
            "texture": "images/cloud-2.png"
        },
        {
            "x": 1216,
            "y": 1630,
            "texture": "images/cloud-3.png"
        },
        {
            "x": 3243,
            "y": 696,
            "texture": "images/cloud-3.png"
        },
        {
            "x": 1875,
            "y": 1140,
            "texture": "images/cloud-2.png"
        },
        {
            "x": 209,
            "y": 1538,
            "texture": "images/cloud-2.png"
        },
        {
            "x": 189,
            "y": 834,
            "texture": "images/cloud-1.png"
        },
        {
            "x": 234,
            "y": 2036,
            "texture": "images/cloud-1.png"
        },
        {
            "x": 1505.5,
            "y": 2071,
            "texture": "images/cloud-2.png"
        },
        {
            "x": 1354,
            "y": 1232,
            "texture": "images/star.png"
        }
    ]
};
