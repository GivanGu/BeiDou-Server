/*
    显示所有在线玩家的NPC
    NPC ID: 9000000
    功能: 列出所有当前在线的玩家名称，支持点击传送
 */

var status = 0;
var selectedPlayer = null;
var allPlayers = [];

function start() {
    status = -1;
    // 添加权限检查
    if (cm.getPlayer().gmLevel() < 1) {
        cm.sendOk("你需要管理员权限才能使用此功能！");
        cm.dispose();
        return;
    }
    action(1, 0, 0);
}

function action(mode, type, selection) {
    // 在所有模式下都先处理状态变化
    if (mode == 1) {
        status++; // 用户点击了"Yes"或选择了选项
    } else if (mode == 0 && status >= 1) {
        status--; // 用户点击了"No"或想返回上一级
    } else if (mode == -1) {
        // 用户直接关闭了窗口
        cm.dispose();
        return;
    }

    if (status == 0) {
        allPlayers = getOnlinePlayers();
        var playerList = "当前在线玩家列表 (" + allPlayers.length + " 人在线):\r\n\r\n";

        if (allPlayers.length > 0) {
            for (var i = 0; i < allPlayers.length; i++) {
                var player = allPlayers[i];
                var playerName = player.getName();
                var level = player.getLevel();
                var jobName = getJobName(player.getJob().getId());
                var mapName = getMapNameByPlayer(player);
                var channelNumber = player.getClient().getChannel(); // 直接使用频道号

                // 使用 #L 指令创建可点击的玩家名称
                playerList += "#L" + i + "##b→ " + playerName + "      (" + level + ", " + jobName + "," + channelNumber + "X," + mapName + ")#k#l\r\n";
            }
        } else {
            playerList += "目前没有任何玩家在线。";
        }

        playerList += "\r\n#L999#关闭#l";
        cm.sendSimple(playerList);
    } else if (status == 1) {
        if (selection == 999) {
            cm.dispose();
        } else if (selection >= 0 && selection < allPlayers.length) {
            selectedPlayer = allPlayers[selection];

            var channelNumber = selectedPlayer.getClient().getChannel(); // 直接使用频道号
            var currentChannelNumber = cm.getPlayer().getClient().getChannel(); // 直接使用当前频道号

            var confirmText = "你确定要传送到 " + selectedPlayer.getName() + " 身边吗？\r\n\r\n";
            confirmText += "等级: Lv." + selectedPlayer.getLevel() + "\r\n";
            confirmText += "职业: " + getJobName(selectedPlayer.getJob().getId()) + "\r\n";
            confirmText += "当前位置: " + getMapNameByPlayer(selectedPlayer) + "\r\n";
            confirmText += "目标频道: " + channelNumber + " (你在 " + currentChannelNumber + " 频道)\r\n\r\n";
            confirmText += "#b注意: 如果目标玩家在不同频道，将会自动切换。#k";

            cm.sendYesNo(confirmText);
        } else {
            // 如果选择超出范围，回到主菜单
            status = 0;
            action(1, 0, 0);
        }
    } else if (status == 2) {
        // 这里需要特别注意：当用户点击"Yes"时，mode=1, selection=0
        // 当用户点击"No"时，mode=0, selection=0
        // 所以我们需要根据mode来判断用户的选择
        if (mode == 1) {
            // 用户点击了"Yes"，进行传送
            teleportToPlayer(selectedPlayer);
        } else {
            // 用户点击了"No"，取消传送
            cm.sendOk("传送已取消。");
            cm.dispose();
        }
    }
}

// 传送至指定玩家的函数
function teleportToPlayer(targetPlayer) {
    var currentPlayer = cm.getPlayer();

    // 再次验证目标玩家是否仍然在线
    var allCurrentPlayers = getOnlinePlayers();
    var stillOnline = false;
    for (var i = 0; i < allCurrentPlayers.length; i++) {
        if (allCurrentPlayers[i].getId() === targetPlayer.getId()) {
            stillOnline = true;
            break;
        }
    }

    if (!stillOnline) {
        cm.sendOk("目标玩家已下线，传送失败。");
        cm.dispose();
        return;
    }

    try {
        var currentChannel = currentPlayer.getClient().getChannel();
        var targetChannel = targetPlayer.getClient().getChannel();

        if (currentChannel !== targetChannel) {
            // 如果在不同频道，切换到目标玩家的频道
            // 注意：这里使用原始的频道索引，不加1
            try {
                currentPlayer.getClient().changeChannel(targetChannel);
            } catch (e) {
                // 如果直接调用失败，提示用户手动切换
                cm.sendOk("跨频道传送失败，请手动切换到频道 " + (targetChannel + 1) + " 后再尝试传送。");
                cm.dispose();
                return;
            }

            // 传送至目标玩家的地图
            currentPlayer.changeMap(targetPlayer.getMapId());
        } else {
            // 如果在同一频道，直接传送到目标玩家的地图
            currentPlayer.changeMap(targetPlayer.getMapId());
        }

        // cm.sendOk("传送成功！你现在已经到达 " + targetPlayer.getName() + " 身边了。");

    } catch (e) {
        cm.sendOk("传送过程中出现错误: " + e + "\r\n详细信息: " + e.lineNumber);
        cm.dispose();
    }
}

// 获取所有在线玩家的辅助函数
function getOnlinePlayers() {
    var players = [];

    try {
        // 通过cm获取服务器实例，然后获取所有世界的玩家
        var gameServer = cm.getClient().getWorldServer();
        if (gameServer) {
            var worlds = gameServer.getWorlds();

            for (var w = 0; w < worlds.length; w++) {
                var world = worlds[w];
                var channels = world.getChannels();

                for (var c = 0; c < channels.length; c++) {
                    var channel = channels[c];
                    var channelPlayers = channel.getPlayerStorage().getAllCharacters();

                    for (var p = 0; p < channelPlayers.length; p++) {
                        players.push(channelPlayers[p]);
                    }
                }
            }
        }
    } catch (e) {
        // 如果直接访问失败，尝试使用cm提供的方法
        // 根据经验教训，NPC脚本中的cm对象可能无法直接使用getServer()
        // 我们只添加基础的获取当前世界玩家的方法
        try {
            var currentWorld = cm.getClient().getWorld();
            var maxChannels = 10; // 假设最多10个频道

            for (var ch = 1; ch <= maxChannels; ch++) {
                try {
                    var channelPlayers = cm.getClient().getChannelServer(ch).getPlayerStorage().getAllCharacters();
                    if (channelPlayers) {
                        for (var p = 0; p < channelPlayers.length; p++) {
                            players.push(channelPlayers[p]);
                        }
                    }
                } catch (e) {
                    // 如果某个频道不存在，则跳过
                    continue;
                }
            }
        } catch (e2) {
            // 如果以上方法都失败，只显示当前地图的玩家
            var mapPlayers = cm.getMap().getCharacters();
            for (var i = 0; i < mapPlayers.size(); i++) {
                players.push(mapPlayers.get(i));
            }
        }
    }

    // 去除重复项
    var uniquePlayers = [];
    var playerIds = {};

    for (var i = 0; i < players.length; i++) {
        var pid = players[i].getId();
        if (!playerIds[pid]) {
            playerIds[pid] = true;
            uniquePlayers.push(players[i]);
        }
    }

    return uniquePlayers;
}

// 专门为玩家获取地图名称的辅助函数
function getMapNameByPlayer(player) {
    if (!player) {
        return "未知地图";
    }

    var mapId = player.getMapId();
    var mapNames = {
        0: "紧急地图",
        100000000: "射手村",
        1000000: "金银岛",
        1010000: "魔法师公会",
        1020000: " Warriors' Sanctuary",
        1030000: "阿朗佩里港",
        1040000: "冒险家之路",
        120000100: "雾の迷宫 1区画",
        200000000: "诺特勒斯港",
        680000000: "玩具列车站台",
        680000100: "开往 orbis 的列车",
        680000101: "开往 orbis 的列车内部",
        680000200: "来自 orbis 的列车",
        680000201: "来自 orbis 的列车内部"
    };

    if (mapNames[mapId]) {
        return mapNames[mapId];
    } else {
        // 尝试获取地图名称
        try {
            // 如果玩家对象可以直接访问地图信息
            if (player.getMap() && typeof player.getMap().getMapName === 'function') {
                var mapName = player.getMap().getMapName();
                if (mapName) {
                    return mapName;
                }
            }
        } catch (e) {
            // 忽略错误
        }
        return "地图 " + mapId;
    }
}

/**
 * 职业ID与名称映射表
 */
const JOB_NAMES = {
    // 新手职业
    0: '新手',

    // 战士系
    100: '战士',
    110: '剑客', 111: '勇士', 112: '英雄',
    120: '准骑士', 121: '骑士', 122: '圣骑士',
    130: '枪战士', 131: '狂战士', 132: '黑骑士',

    // 法师系
    200: '法师',
    210: '火毒法师', 211: '火毒巫师', 212: '火毒魔导师',
    220: '冰雷法师', 221: '冰雷巫师', 222: '冰雷魔导师',
    230: '牧师', 231: '祭司', 232: '主教',

    // 弓箭手系
    300: '弓箭手',
    310: '猎人', 311: '射手', 312: '神射手',
    320: '弩弓手', 321: '游侠', 322: '箭神',

    // 飞侠系
    400: '飞侠',
    410: '刺客', 411: '无影人', 412: '隐士',
    420: '侠客', 421: '独行客', 422: '侠盗',

    // 海盗系
    500: '海盗',
    510: '拳手', 511: '格斗家', 512: '冲锋队长',
    520: '枪手', 521: '大副', 522: '船长'
};

/**
 * 根据职业ID获取职业名称
 */
function getJobName(jobId) {
    return JOB_NAMES[jobId];
}