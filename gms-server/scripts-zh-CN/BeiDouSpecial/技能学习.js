/**
 * @description 学习技能
 */
var OldTitle = "#eBeiDou技能学习中心#n\r\n";
var status = -1;
var lastSkillInfo = null;
var resultType = "";
var needCostConfirm = false;

// ========== 技能学习消耗配置（可自由调整）==========
var costItemId = 4310000;
var cost4111006ItemQty = 50;
var cost4111006Meso = 1000000000;
var cost4111006Cash = 100000;
var cost2101002ItemQty = 30;
var cost2101002Meso = 500000000;
var cost2101002Cash = 100000;

var skillCosts = {
    4111006: { itemId: costItemId, itemQty: cost4111006ItemQty, meso: cost4111006Meso, cash: cost4111006Cash },
    2101002: { itemId: costItemId, itemQty: cost2101002ItemQty, meso: cost2101002Meso, cash: cost2101002Cash }
};

function start() {
    action(1, 0, 0)
}

function action(mode, type, selection) {
    if (mode === 1) {
        status++;
    } else if (mode === -1) {
        status--;
    } else {
        cm.dispose();
        return;
    }

    if (status === 0) {
        showSkillList();
    } else if (status === 1) {
        handleSkillSelection(selection);
    } else if (status === 2) {
        if (needCostConfirm) {
            handleCostConfirmation();
        } else {
            handleResultSelection(selection);
        }
    } else if (status === 3) {
        handleResultSelection(selection);
    }
}

function formatMeso(amount) {
    if (amount >= 100000000) {
        return (amount / 100000000).toFixed(1) + "亿";
    } else if (amount >= 10000) {
        return (amount / 10000).toFixed(0) + "万";
    }
    return amount.toString();
}

function showSkillList() {
    var player = cm.getPlayer();
    
    var hasDoubleJump = player.getSkillLevel(4111006) > 0;
    var hasTeleport = player.getSkillLevel(2101002) > 0;
    
    var text = OldTitle;
    text += "#b════════════════#k\r\n\r\n";
    text += "选择要学习的技能：#n\r\n\r\n";
    
    if (hasDoubleJump) {
        text += "#L0##b#s4111006# #q4111006##k (已学会，重新绑定#e-#n键)#l\r\n\r\n";
    } else {
        text += "#L0##b#s4111006# #q4111006##k (学习并绑定#e-#n键)#l\r\n\r\n";
    }
    
    if (hasTeleport) {
        text += "#L1##b#s2101002# #q2101002##k (已学会，重新绑定#e+#n键)#l\r\n\r\n";
    } else {
        text += "#L1##b#s2101002# #q2101002##k (学习并绑定#e+#n键)#l\r\n\r\n";
    }
    
    text += "#L2#取消#l";
    
    cm.sendSimple(text);
}

function handleSkillSelection(selection) {
    var skillId, keyCode, skillName, keyName, keySymbol;
    
    switch (selection) {
        case 0:  // 二段跳
            skillId = 4111006;
            keyCode = 12;  // -键
            skillName = "#q4111006#";
            keyName = "#e-#n键";
            keySymbol = "#e-#n";
            break;
        case 1:  // 快速移动
            skillId = 2101002;
            keyCode = 13;  // +键
            skillName = "#q2101002#";
            keyName = "#e+#n键";
            keySymbol = "#e+#n";
            break;
        case 2:  // 取消
            cm.sendOk("#b已取消。#k");
            cm.dispose();
            return;
    }
    
    // 保存技能信息
    lastSkillInfo = {
        skillId: skillId,
        keyCode: keyCode,
        skillName: skillName,
        keyName: keyName,
        keySymbol: keySymbol
    };
    
    var player = cm.getPlayer();
    var hasSkill = player.getSkillLevel(skillId) > 0;
    
    if (hasSkill) {
        // 已学会，直接重新绑定（不收费）
        needCostConfirm = false;
        var result = processSkill(skillId, keyCode, skillName, keyName, keySymbol);
        resultType = result.success ? "success" : "fail";
        showResult(result);
    } else {
        // 未学会，先显示消耗确认
        needCostConfirm = true;
        showCostConfirmation(skillId, skillName);
    }
}

function showCostConfirmation(skillId, skillName) {
    var cost = skillCosts[skillId];
    var itemName = "#z" + cost.itemId + "#";
    
    var text = OldTitle;
    text += "#b════════════════#k\r\n\r\n";
    text += "确定要学习 " + skillName + " 吗？\r\n\r\n";
    text += "#i" + cost.itemId + "# " + itemName + " x" + cost.itemQty + "\r\n";
    text += "#i4031138# 金币 " + formatMeso(cost.meso) + "\r\n";
    text += "#fUI/CashShop.img/CashItem/0#  点券 " + cost.cash + "\r\n\r\n";
    text += "确认后将立即扣除以上消耗。";
    
    cm.sendYesNo(text);
}

function handleCostConfirmation() {
    if (lastSkillInfo === null) {
        status = 0;
        showSkillList();
        return;
    }
    
    var result = processSkill(
        lastSkillInfo.skillId,
        lastSkillInfo.keyCode,
        lastSkillInfo.skillName,
        lastSkillInfo.keyName,
        lastSkillInfo.keySymbol
    );
    resultType = result.success ? "success" : "fail";
    showResult(result);
}

function showResult(result) {
    var text = OldTitle;
    text += "#b════════════════#k\r\n";
    
    if (result.success) {
        text += "#e操作结果#n\r\n";
        text += "#b════════════════#k\r\n\r\n";
        text += result.message;
        text += "\r\n\r\n#b════════════════#k\r\n\r\n";
        text += "#L0#再学其他技能#l\r\n";
        text += "#L1#完成#l";
    } else {
        text += "#r操作失败#n\r\n";
        text += "#b════════════════#k\r\n\r\n";
        text += result.message;
        text += "\r\n\r\n#b════════════════#k\r\n\r\n";
        text += "#L0#再试一次#l\r\n";
        text += "#L1#返回#l\r\n";
        text += "#L2#取消#l";
    }
    
    cm.sendSimple(text);
}

function handleResultSelection(selection) {
    if (resultType === "success") {
        if (selection === 0) {
            // 继续学习其他技能
            status = 0;
            showSkillList();
        } else if (selection === 1) {
            // 完成并关闭窗口
            cm.sendOk("#b操作完成。#k");
            cm.dispose();
        }
    } else if (resultType === "fail") {
        if (selection === 0) {
            // 重新尝试
            if (lastSkillInfo !== null) {
                var result = processSkill(
                    lastSkillInfo.skillId,
                    lastSkillInfo.keyCode,
                    lastSkillInfo.skillName,
                    lastSkillInfo.keyName,
                    lastSkillInfo.keySymbol
                );
                resultType = result.success ? "success" : "fail";
                showResult(result);
            } else {
                status = 0;
                showSkillList();
            }
        } else if (selection === 1) {
            // 返回技能列表
            status = 0;
            showSkillList();
        } else if (selection === 2) {
            // 取消
            cm.sendOk("#b已取消。#k");
            cm.dispose();
        }
    }
}

// 直接写入数据库（绕过 saveCharToDB，防止其失败导致数据丢失）
function directSaveToDB(skillId, keyCode) {
    try {
        var DatabaseConnection = Java.type('org.gms.util.DatabaseConnection');
        var con = DatabaseConnection.getConnection();
        try {
            // 保存技能到 skills 表
            var psSkill = con.prepareStatement("REPLACE INTO skills (characterid, skillid, skilllevel, masterlevel, expiration) VALUES (?, ?, ?, ?, -1)");
            try {
                psSkill.setInt(1, cm.getPlayer().getId());
                psSkill.setInt(2, skillId);
                psSkill.setInt(3, 20);
                psSkill.setInt(4, 20);
                psSkill.executeUpdate();
            } finally {
                psSkill.close();
            }
            
            // 保存键位到 keymap 表（先删旧键位再插入）
            var psDelKey = con.prepareStatement("DELETE FROM keymap WHERE characterid = ? AND `key` = ?");
            try {
                psDelKey.setInt(1, cm.getPlayer().getId());
                psDelKey.setInt(2, keyCode);
                psDelKey.executeUpdate();
            } finally {
                psDelKey.close();
            }
            var psKey = con.prepareStatement("INSERT INTO keymap (characterid, `key`, `type`, `action`) VALUES (?, ?, 1, ?)");
            try {
                psKey.setInt(1, cm.getPlayer().getId());
                psKey.setInt(2, keyCode);
                psKey.setInt(3, skillId);
                psKey.executeUpdate();
            } finally {
                psKey.close();
            }
            
            // cm.getPlayer().dropMessage("DB直写成功");
            return true;
        } catch (e) {
            // cm.getPlayer().dropMessage("DB直写出错：" + e.toString());
            return false;
        } finally {
            con.close();
        }
    } catch (e) {
        // cm.getPlayer().dropMessage("DB连接出错：" + e.toString());
        return false;
    }
}

// 处理技能学习和绑定的主函数
function processSkill(skillId, keyCode, skillName, keyName, keySymbol) {
    var player = cm.getPlayer();
    var messages = [];
    var success = true;
    var alreadyLearned = false;
    
    // 检查是否已学习技能
    var hasSkill = player.getSkillLevel(skillId) > 0;
    
    if (!hasSkill) {
        // 检查消耗是否足够
        var costCheck = checkAndDeductCost(skillId);
        if (!costCheck.success) {
            messages.push("#r" + costCheck.message + "#k");
            success = false;
        } else {
            // 学习技能 - 直接学习，跳过职业检查
            var learnResult = learnSkill(skillId, skillName);
            if (learnResult.success) {
                if (costCheck.consumed) {
                    messages.push(costCheck.message);
                }
                messages.push(learnResult.message);
            } else {
                messages.push("#r学习失败：" + learnResult.message + "#k");
                success = false;
            }
        }
    } else {
        messages.push("#g已学会" + skillName + "。#k");
        alreadyLearned = true;
    }
    
    // 绑定技能
    if (success) {
        var bindResult = bindSkill(skillId, skillName, keyCode, keyName, keySymbol, alreadyLearned);
        if (bindResult.success) {
            messages.push(bindResult.message);
        } else {
            messages.push("#r绑定失败：" + bindResult.message + "#k");
            success = false;
        }
    }
    
    // 直接写入数据库（保证数据持久化，独立于 saveCharToDB）
    if (success) {
        directSaveToDB(skillId, keyCode);
    }
    
    // 立即发送键位表到客户端，确保客户端知道这个绑定
    if (success) {
        try {
            player.sendKeymap();
        } catch (e) {
            // ignore
        }
    }
    
    // 同时调用官方保存接口作为补充
    if (success) {
        try {
            player.saveCharToDB(true);
        } catch (e) {
            messages.push("#r官方保存失败（已用直写保证数据）：" + e.toString() + "#k");
        }
    }
    
    return {
        success: success,
        message: messages.join("\r\n\r\n")
    };
}

// 检查并扣除学习消耗
function checkAndDeductCost(skillId) {
    var cost = skillCosts[skillId];
    if (!cost) {
        return {success: true, consumed: false, message: ""};
    }
    
    var itemName = "#z" + cost.itemId + "#";
    
    // 先检查金币是否足够
    if (cm.getMeso() < cost.meso) {
        return {
            success: false,
            consumed: false,
            message: "金币不足！需要 " + formatMeso(cost.meso) + " 金币，请准备后再来。"
        };
    }
    
    // 再检查物品是否足够
    if (!cm.haveItem(cost.itemId, cost.itemQty)) {
        return {
            success: false,
            consumed: false,
            message: "材料不足！需要 " + itemName + " x" + cost.itemQty + "，请准备后再来。"
        };
    }
    
    // 检查点券是否足够
    if (cm.getPlayer().getCashShop().getCash(1) < cost.cash) {
        return {
            success: false,
            consumed: false,
            message: "点券不足！需要 " + cost.cash + " 点券，请准备后再来。"
        };
    }
    
    // 扣除物品、金币和点券
    cm.gainItem(cost.itemId, -cost.itemQty);
    cm.gainMeso(-cost.meso);
    cm.getPlayer().getCashShop().gainCash(1, -cost.cash);
    
    var parts = ["#g消耗：" + itemName + " x" + cost.itemQty + "，" + formatMeso(cost.meso) + " 金币"];
    if (cost.cash > 0) {
        parts.push(cost.cash + " 点券");
    }
    return {
        success: true,
        consumed: true,
        message: parts.join("，") + "#k"
    };
}

// 学习技能的函数 - 修改版，跳过职业检查
function learnSkill(skillId, skillName) {
    var player = cm.getPlayer();
    
    if (player.getSkillLevel(skillId) > 0) {
        return {success: true, message: "#g已学会" + skillName + "。#k"};
    }
    
    try {
        var SkillFactory = Java.type('org.gms.client.SkillFactory');
        var skill = SkillFactory.getSkill(skillId);
        
        if (skill == null) {
            return {success: false, message: "技能不存在"};
        }
        
        // 获取技能最大等级
        var maxLevel = 20;
        try {
            maxLevel = skill.getMaxLevel();
            if (maxLevel <= 0) {
                maxLevel = 20;
            }
        } catch (e) {
            maxLevel = 20;
        }
        
        // 直接学习技能，不检查职业限制
        player.changeSkillLevel(skill, maxLevel, maxLevel, -1);
        
        // 立即持久化技能到数据库（双重保障）
        player.saveCharToDB(true);
        
        return {
            success: true, 
            message: "#g学会" + skillName + "#k\r\n" +
                     "等级：" + maxLevel + "/" + maxLevel
        };
        
    } catch (e) {
        return {success: false, message: "学习出错：" + e.toString()};
    }
}

// 绑定技能的函数
function bindSkill(skillId, skillName, keyCode, keyName, keySymbol, alreadyLearned) {
    var player = cm.getPlayer();
    
    if (player.getSkillLevel(skillId) <= 0) {
        return {success: false, message: "还未学习此技能"};
    }
    
    try {
        var KeyBinding = Java.type('org.gms.client.keybind.KeyBinding');
        var javaKeyBinding = new KeyBinding(1, skillId);
        
        player.changeKeybinding(keyCode, javaKeyBinding);
        
        var message = "";
        if (alreadyLearned) {
            message = "#g重新绑定" + skillName + "到" + keyName + "#k";
        } else {
            message = "#g绑定" + skillName + "到" + keyName + "#k";
        }
        
        message += "\r\n按键：" + keySymbol + "键";
        message += "\r\n#e注意：#n换线后才能看到键位变化";
        
        return {success: true, message: message};
        
    } catch (e1) {
        try {
            var KeyBinding = Java.type('org.gms.client.keybind.KeyBinding');
            var javaKeyBinding = new KeyBinding(1, skillId);
            
            if (typeof player.setKeybinding === 'function') {
                player.setKeybinding(keyCode, javaKeyBinding);
            } else if (typeof player.setKeyBinding === 'function') {
                player.setKeyBinding(keyCode, javaKeyBinding);
            } else if (typeof player.updateKeybinding === 'function') {
                player.updateKeybinding(keyCode, javaKeyBinding);
            } else {
                return {success: false, message: "不支持绑定功能"};
            }
            
            var message = "";
            if (alreadyLearned) {
                message = "#g重新绑定" + skillName + "到" + keyName + "#k";
            } else {
                message = "#g绑定" + skillName + "到" + keyName + "#k";
            }
            
            message += "\r\n按键：" + keySymbol + "键";
            message += "\r\n#e注意：#n换线后才能看到键位变化";
            
            return {success: true, message: message};
            
        } catch (e2) {
            return {success: false, message: "绑定出错：" + e2.toString()};
        }
    }
}