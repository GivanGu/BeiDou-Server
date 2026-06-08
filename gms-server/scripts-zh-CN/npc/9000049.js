/*
    NPC: Donation Box (9000041)
    Victoria Road : Henesys
*/

var options = ["装备", "消耗品", "设置", "其他"];
var status = -1;
var selectedType = 0;
var selectedPage = 0;
var SLOTS_PER_PAGE = 24;
var item_name = null;
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

        // if (unlockedSlots == 0) {
        //     cm.sendOk("你的 " + options[selectedType] + " 栏还没有解锁任何格子！\r\n请先扩展背包再使用此功能。");
        //     cm.dispose();
        //     return;
        // }

        var unlockedPages = Math.floor((unlockedSlots - 1) / SLOTS_PER_PAGE) + 1;

        var selStr = "你选择了 #b" + options[selectedType] + "#k 栏。\r\n";
        selStr += "当前已解锁格子数: #r" + unlockedSlots + "#k\r\n";
        selStr += "对应 " + unlockedPages + " 页背包。\r\n\r\n";
        selStr += "#b请选择要开始出售的页面:#k\r\n";
        selStr += "#r注意注意注意：选择页面N后，第N页及以后的所有物品都将被出售！#k\r\n\r\n";

        for (var i = 1; i <= unlockedPages; i++) {
            var startSlot = (i - 1) * SLOTS_PER_PAGE + 1;
            var endSlot = Math.min(i * SLOTS_PER_PAGE, unlockedSlots);
            selStr += "#L" + i + "# 第 " + i + " 页 (格子 " + startSlot + " - " + endSlot + ")#l\r\n";
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

        // 根据用户选择遍历对应背包
        var inventory = cm.getInventory(invType); // InventoryType: 1=装备, 2=消耗, 3=设置, 4=其他, 5=现金
        var items = inventory.list();

        if (items.isEmpty()) {
            cm.sendOk("这个背包是空的!");
            cm.dispose();
            return;
        }

        // var item = inventory.getItem(26);


        var text = "";
        var count = 0;
        // cm.getPlayer().dropMessage(1, "startPosition" + startPosition + " , unlockedSlots" + unlockedSlots);

        for (var i = startPosition; i <= unlockedSlots; i++) {
            var item = inventory.getItem(i);

            if (item == null) {
                continue;
            }
            if (item_name == null) {
                var ItemInformationProvider = Java.type('org.gms.server.ItemInformationProvider');
                var ii = ItemInformationProvider.getInstance();
                var itemId = item.getItemId();
                item_name = ii.getName(itemId);
            }
            text += "#i" + item.getItemId() + "# #z" + item.getItemId() + "# " + item_name;
            text += "x" + item.getQuantity() + "\r\n";
            // 每显示10个物品换一页,避免溢出
            if (count % 10 == 0) {
                text += "\r\n";
            }

            count++;
        }
        if (count > 0) {
            text_strat = "从#r" + options[selectedType] + "栏 第[" + startPosition + "]个#k开始:\r\n 以下为要出售的物品，总共: #r" + count + " #k个\r\n\r\n";
            cm.sendOk(text_strat + text);
        }
        else {
            cm.sendOk("从#r" + options[selectedType] + "栏 第[" + startPosition + "]个#k开始, 啥都没有你卖个" + "#fUI/GuildMark.img/Mark/Animal/00002000/2#?");
            cm.dispose();
            return;
        }

    }
    else if (status == 4) {
        var ItemInformationProvider = Java.type('org.gms.server.ItemInformationProvider');
        var ii = ItemInformationProvider.getInstance();

        var InventoryType = Java.type('org.gms.client.inventory.InventoryType');
        var type = InventoryType.getByType(selectedType + 1);

        // cm.getPlayer().dropMessage(1, "startPosition" + startPosition);

        var res = cm.getPlayer().sellAllItemsFromPosition(ii, type, startPosition);

        if (res > -1) {
            cm.sendOk("交易完成！你从这个行动中获得了#r" + cm.numberWithCommas(res) + "金币#k。");
        } else {
            cm.sendOk("你的#b' " + options[selectedType] + "' #k栏中没有#b '" + item_name + "' #k！");
        }

        cm.dispose();
    }
}