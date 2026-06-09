/*
    NPC: Donation Box (9000041)
    Victoria Road : Henesys
*/

// ==================== 配置区域 ====================
// SCRIPT_MODE = 1  -> 原版（显示所有页面，包括第1页）
// SCRIPT_MODE = 2  -> 安全版（屏蔽第1页，只显示第2页及以后）
var SCRIPT_MODE = 2;   // 默认为原版，可根据需要改为2
// ================================================

var options = ["装备", "消耗品", "设置", "其他"];
var status = -1;
var selectedType = 0;
var selectedPage = 0;
var SLOTS_PER_PAGE = 24;
var startPosition = -1;

function start() {
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode != 1) {
        cm.dispose();
        return;
    }

    status++;

    if (status == 0) {
        var GameConfig = Java.type('org.gms.config.GameConfig');
        if (!GameConfig.getServerBoolean("use_enable_custom_npc_script")) {
            cm.sendOk("勋章排名系统目前不可用。");
            cm.dispose();
            return;
        }

        var selStr = "你好，我是 #b集市 NPC#k！把你不需要的任何物品卖给我吧。\r\n\r\n";
        for (var i = 0; i < options.length; i++) {
            selStr += "#L" + i + "# " + options[i] + "#l\r\n";
        }
        cm.sendSimple(selStr);

    } else if (status == 1) {
        selectedType = selection;
        var unlockedSlots = cm.getPlayer().getSlots(selectedType + 1);

        var unlockedPages = Math.floor((unlockedSlots - 1) / SLOTS_PER_PAGE) + 1;

        var selStr = "你选择了 #b" + options[selectedType] + "#k 栏。\r\n";
        selStr += "当前已解锁格子数: #r" + unlockedSlots + "#k\r\n";
        selStr += "对应 " + unlockedPages + " 页背包。\r\n\r\n";
        
        if (SCRIPT_MODE == 2) {
            selStr += "#b请选择要开始出售的页面:#k\r\n";
            selStr += "#r注意：第1页选项已被屏蔽，无法从第1页开始出售！#k\r\n\r\n";
        } else {
            selStr += "#b请选择要开始出售的页面:#k\r\n";
            selStr += "#r注意：出售后无法找回，请谨慎选择起始页面！#k\r\n\r\n";
        }

        var hasOption = false;
        for (var i = 1; i <= unlockedPages; i++) {
            if (SCRIPT_MODE == 2 && i == 1) continue;
            
            var startSlot = (i - 1) * SLOTS_PER_PAGE + 1;
            var endSlot = Math.min(i * SLOTS_PER_PAGE, unlockedSlots);
            selStr += "#L" + i + "# 第 " + i + " 页 (格子 " + startSlot + " - " + endSlot + ")#l\r\n";
            hasOption = true;
        }

        if (!hasOption) {
            if (SCRIPT_MODE == 2) {
                cm.sendOk("抱歉，由于安全原因，无法从第1页开始出售，且您的背包只有第1页可用。\r\n请扩展更多背包格子后再来出售。");
            } else {
                cm.sendOk("您的背包没有任何可用格子，无法出售。");
            }
            cm.dispose();
            return;
        }

        cm.sendSimple(selStr);

    } else if (status == 2) {
        selectedPage = selection;

        var unlockedSlots = cm.getPlayer().getSlots(selectedType + 1);
        var unlockedPages = Math.floor((unlockedSlots - 1) / SLOTS_PER_PAGE) + 1;

        if (selectedPage < 1 || selectedPage > unlockedPages) {
            cm.sendOk("错误：选择的页码超出范围！\r\n请重新选择 1-" + unlockedPages + " 之间的页码。");
            cm.dispose();
            return;
        }

        startPosition = (selectedPage - 1) * SLOTS_PER_PAGE + 1;
        var endPage = unlockedPages;

        var selStr = "#确认出售以下物品：#k\r\n\r\n";
        selStr += "#b物品类型:#k " + options[selectedType] + "\r\n";
        selStr += "#b开始位置:#k 第 " + selectedPage + " 页 (格子 " + startPosition + ")\r\n";
        selStr += "#b结束位置:#k 第 " + endPage + " 页 (格子 " + unlockedSlots + ")\r\n";
        selStr += "#b影响范围:#k 第 " + selectedPage + " 页到第 " + endPage + " 页的所有物品\r\n\r\n";
        selStr += "#r出售后将无法找回，确认要继续吗？#k";

        cm.sendYesNo(selStr);

    } else if (status == 3) {
        var invType = selectedType + 1;
        var unlockedSlots = cm.getPlayer().getSlots(invType);
        startPosition = (selectedPage - 1) * SLOTS_PER_PAGE + 1;

        if (unlockedSlots == 0 || startPosition > unlockedSlots) {
            cm.sendOk("错误：背包状态或页码无效，出售失败！");
            cm.dispose();
            return;
        }

        var inventory = cm.getInventory(invType);
        var items = inventory.list();

        if (items.isEmpty()) {
            cm.sendOk("这个背包是空的!");
            cm.dispose();
            return;
        }

        var text = "";
        var count = 0;

        for (var i = startPosition; i <= unlockedSlots; i++) {
            var item = inventory.getItem(i);
            if (item == null) continue;
            text += "#i" + item.getItemId() + "# #z" + item.getItemId() + "# x #b" + item.getQuantity() + "#k\r\n";
            count++;
        }

        if (count > 0) {
            var text_start = "从#r" + options[selectedType] + "栏 #k第#r[" + startPosition + "]#k格 #k开始:\r\n";
            text_start += "以下为要出售的物品，总共: #r" + count + " #k个 #r（按ESC取消出售）#k\r\n\r\n";
            text_start += text;
            cm.sendOk(text_start);
        } else {
            // 修改点：将“个”改为“格”，“第”“格”改为黑色
            cm.sendOk("从#r" + options[selectedType] + "栏 #k第#r[" + startPosition + "]#k格 #k开始，没有道具可以出售！");
            cm.dispose();
            return;
        }

    } else if (status == 4) {
        var ItemInformationProvider = Java.type('org.gms.server.ItemInformationProvider');
        var ii = ItemInformationProvider.getInstance();

        var InventoryType = Java.type('org.gms.client.inventory.InventoryType');
        var type = InventoryType.getByType(selectedType + 1);

        var res = cm.getPlayer().sellAllItemsFromPosition(ii, type, startPosition);

        if (res > -1) {
            cm.sendOk("交易完成！你从这个行动中获得了#r" + cm.numberWithCommas(res) + "金币#k。");
        } else {
            cm.sendOk("出售失败，请重试或联系管理员。");
        }

        cm.dispose();
    }
}