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
    // 控制区域的大小
    controlRect: {
        // 宽度
        width: 1920,
        // 高度
        height: 1080,
    },
    // 摇杆半径
    rockerRadius: 90,
    // 飞机船体的像素长度
    planePixelLength: 17,
    // 飞机的速度
    planeVelocity: 30,
    // 飞机的推进力
    planeEngineForce: 33,
    // 飞机旋转的速度
    planeAngularVelocity: Math.PI / 180 * 6,
    // 虫子跟随飞机的位置是飞机几帧前的
    planePastPosLength: 15,
    // 陨石物理半径（米）
    meteorRadius: 1.71875,
    // 陨石生成时的最小速度
    meteorMinVelocity: 10,
    // 陨石生成时的最大速度
    meteorMaxVelocity: 16,
    // 初始化时生成陨石的最小数量
    meteorMinCount: 10,
    // 初始化时生成陨石的最大数量
    meteorMaxCount: 20,
    // 陨石的弹性系数（0到1，数字越大，弹性越大）
    meteorRestitution: 1.00,
    // 陨石的旋转速度
    meteorAngularVelocity: Math.PI / 180 * 65,
    // 每帧刷新陨石的可能性(0.01表示百分之一，0.5表示百分之五十)
    refreshMeteorProbability: 0.05,
    // 陨石相关配置
    meteor: {
        // 陨石数量随着时间的裱花
        countBySeconds: {
            "30": 30,
            "60": 40,
            "90": 80,
        }
    },
    // 每帧刷新陨石的最小数量
    refreshMeteorMinCount: 0.5,
    // 每帧刷新陨石的最大数量
    refreshMeteorMaxCount: 1,
    // 虫子的旋转速度
    wormAngularVelocity: Math.PI / 180 * 4,
    // 虫子的速度
    wormVelocity: 33,
    // 虫子的推进力
    wormEngineForce: 11,
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
    // 飞机原始放大尺寸
    planeBaseScale: 5,
    // 飞机变大配置，有几项就能变大几次，变大系数是按照元素像素来的
    planeScaleList: [5, 6, 7, 8, 9, 10, 11],
    // 虫子爆炸掉落红心概率
    wormDropHeartProbability: 0.20,
    imagePath: {
        cloud1: "images/cloud-1.png",
        cloud2: "images/cloud-2.png",
        cloud3: "images/cloud-3.png",
        terrain1: "images/terrain-1.png",
        terrain2: "images/terrain-2.png",
        terrain3: "images/terrain-3.png",
        star: "images/star.png",
        bg: "images/bg.png",
        rocket: [
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
            "images/worm-2.png",
        ],
        heart: "images/red-heart.png",
        item: [
            "images/random-item-1.png",
            "images/random-item-2.png",
            "images/random-item-3.png",
            "images/random-item-4.png",
        ],
        electricSaw: "images/electric-saw.png",
        bomb: "images/bomb.png",
        bombExplode: [
            "images/bomb-explode-1.png",
            "images/bomb-explode-2.png",
            "images/bomb-explode-3.png",
            "images/bomb-explode-4.png",
            "images/bomb-explode-5.png",
        ],
        planeExplode: [
            "images/plane-explode-1.png",
            "images/plane-explode-2.png",
            "images/plane-explode-3.png",
            "images/plane-explode-4.png",
            "images/plane-explode-5.png",
        ],
        meteorExplode: [
            "images/meteor-explode-1.png",
            "images/meteor-explode-2.png",
            "images/meteor-explode-3.png",
            "images/meteor-explode-4.png",
        ],
        shield: "images/shield.png",
        rocker: "images/rocker.png",
        rockerBottom: "images/rocker-bottom.png",
        title: "images/title.png",
        startButton: "images/start-button.png",
        restartButton: "images/restart-button.png",
        mainButton: "images/main-button.png",
        shareButton: "images/share-button.png",
        adButton: "images/ad-button.png",
    },
    soundPath: {
        bombExplode: "sounds/bomb-explode.mp3",
        planeExplode: "sounds/plane-explode.mp3",
        enemyExplode: "sounds/enemy-explode.mp3",
        pickItem: "sounds/pick-item.mp3",
        confused: "sounds/confused.mp3",
        shoot: "sounds/shoot.mp3",
        trail: "sounds/trail.mp3",
        esRotate: "sounds/electric-saw-rotate.mp3",
    },
    // 红心相关配置
    worm: {
        // 宽度(像素)
        width: 110,
        // 高度(像素)
        height: 35,
    },
    // 红心相关配置
    heart: {
        // 宽度(像素)
        width: 45,
        // 高度(像素)
        height: 35,
    },
    // 物品相关配置
    item: {
        // 宽度(像素)
        width: 75,
        // 高度(像素)
        height: 100,
    },
    // 电锯相关配置
    electricSaw: {
        // 电锯密度（越大越重）
        density: 0.01,
        // 可以进行几次碰撞
        collideTimes: 12,
        // 距离飞船的距离
        distance: 150,
        // 距离飞船的距离
        angularVelocity: Math.PI / 180 * 10,
        // 同时能存在的最大数量
        maxCount: 5,
        // 半径(像素)
        radius: 35,
    },
    // 炸弹爆炸半径列表
    bombExplodeRadiusList: [
        30,
        47.5,
        130,
        214,
        252,
    ],
    // 混乱相关配置
    confused: {
        // 持续帧数
        countdown: 500,
        // 开始混乱无敌帧数
        startInvincibleFrames: 300,
        // 结束混乱无敌帧数
        endInvincibleFrames: 100,
    },
    // 盾牌相关配置
    shield: {
        // 可以进行几次碰撞
        collideTimes: 8,
        // 距离飞船的距离
        distance: 100,
        // 宽度(像素)
        width: 25,
        // 高度(像素)
        height: 50,
    },
    // 刷新道具的时间间隔
    refreshItemInterval: 6.5,
    // 刷新道具中心最少距离墙壁多少像素
    refreshItemOffset: 100,
    // 每动画帧占用多少游戏帧
    frameInterval: 8,
    // 炸弹图标显示位置
    bombIconPos: {
        x: 10,
        y: 10
    },
    // 背景星星相关配置
    star: {
        // 数量
        count: 35,
    },
    // 背景云相关配置
    cloud: {
        // 云每帧的最小速度
        minSpeed: 0.1,
        // 云每帧的最大速度
        maxSpeed: 0.2
    },
    // 随即出来的道具类型
    randomItemList: [
        "ElectricSaw",
        "Bomb",
        "Shield",
        "Confused",
    ],
    startScene: {
        title: {
            position: {
                y: 100
            }
        },
    },
    gameOverScene: {
        restartButton: {
            position: {
                y: 540
            }
        },
        mainButton: {
            position: {
                y: 740
            }
        },
        adButton: {
            position: {
                x: 1800,
                y: 750
            }
        },
        shareButton: {
            position: {
                x: 1800,
                y: 950
            }
        },
    },
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
        }
    ]
};
