// ==============================================
// 任务达人系统 NPC 脚本
// ==============================================

// 导入 Java 数据库连接类
var DatabaseConnection = Java.type("org.gms.util.DatabaseConnection");

// 状态变量
var status = -1;

/**
 * NPC 对话入口函数
 */
function start() {
    action(1, 0, 0);
}

/**
 * NPC 对话处理器
 */
function action(mode, type, selection) {
    // 非继续模式则结束对话
    if (mode != 1) {
        cm.dispose();
        return;
    }

    // 根据对话模式更新状态
    status = mode === 1 ? status + 1 : status - 1;

    // 状态机路由
    if (status == 0) {
        showMainMenu();              // 显示主菜单
    } else if (status == 1) {
        handleMainMenuSelection(selection); // 处理主菜单选择
    }

}

/**
 * 处理主菜单选择
 */
function handleMainMenuSelection(selection) {
    switch (selection) {
        case 0:
            showTotalRanking();      // 查看总排行榜
            break;
        case 1:
            showPersonalProgress();  // 查看个人进度
            break;
        default:
            cm.dispose();
    }
}

/**
 * 显示主菜单界面
 */
function showMainMenu() {
    var text = "#e#d★ 怀旧岛 - 任务排行榜 ★#n#k\r\n\r\n";
    text += "#L0##b查看任务排行榜 (TOP 15)#l\r\n";
    text += "#L1##b查看我的任务完成情况#l";
    cm.sendSimple(text);
}

/**
 * 显示总排行榜（TOP 10）
 */
function showTotalRanking() {
    var spaces = "";
    for (var j = 0; j < 18; j++) { spaces += " "; }
    var text = `#e#d排名${spaces}角色名${spaces}职业${spaces}完成数#k\r\n`;
    text += "#e-------------------------------------------------------------------------#k\r\n";

    var conn = null;
    var ps = null;
    var rs = null;

    try {
        // 获取数据库连接
        conn = DatabaseConnection.getConnection();

        // SQL：统计每个角色已完成的任务数量并排序
        var sql = `
        SELECT 
             c.name, 
             c.job, 
             COUNT(q.characterid) as cnt
        FROM characters c
        INNER JOIN queststatus q ON c.id = q.characterid
        WHERE q.completed = 1
        GROUP BY c.id, c.name, c.job
        ORDER BY cnt DESC
        LIMIT 15
        `;

        ps = conn.prepareStatement(sql);
        rs = ps.executeQuery();

        var i = 0;
        while (rs.next()) {
            i++;
            // 获取查询结果
            var name = rs.getString("name");
            var count = rs.getInt("cnt");
            var jobId = rs.getInt("job");
            var jobName = getJobName(jobId);

            // 根据排名设置颜色
            var color = "#b";
            if (i == 1) { color = "#r"; }      // 第一名：红色
            else if (i == 2) { color = "#d"; } // 第二名：紫色
            else if (i == 3) { color = "#g"; } // 第三名：绿色
            else { color = "#k"; }              // 其他：黑色

            // 格式化排名显示（01, 02...）
            var rankStr = (i < 10 ? "0" + i : i.toString());
            text += color + "【" + rankStr + "】 #k" + "     " + name;
            text += spaces + jobName + spaces + color + count + "#k\r\n";
        }

        // 无数据时的提示
        if (i == 0) {
            text += "#e暂无排名记录#k";
        }

    } catch (e) {
        // 异常处理
        text = "#r数据查询失败。#k";
    } finally {
        // 资源清理
        try {
            if (rs != null) rs.close();
            if (ps != null) ps.close();
            if (conn != null) conn.close();
        } catch (err) { /* 忽略关闭异常 */ }
    }

    cm.sendOk(text);
    cm.dispose();
}

/**
 * 显示个人任务完成进度
 */
function showPersonalProgress() {
    try {
        var player = cm.getPlayer();
        var charName = player.getName();
        var completedCount = 0;

        // 从玩家对象获取已完成任务集合
        var completedQuests = player.getCompletedQuests();
        if (completedQuests != null) {
            completedCount = completedQuests.size();
        }

        // 构建显示文本
        var text = "#e#d★ 我的任务完成情况 ★#n#k\r\n\r\n";
        text += "#e角色名：#r" + charName + "#k\r\n";
        text += "#e完成数：" + completedCount + "\r\n\r\n";

        cm.sendOk(text);

    } catch (e) {
        // 异常处理
        cm.sendOk("查询个人信息失败，请稍后再试。");
    } finally {
        cm.dispose();
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

