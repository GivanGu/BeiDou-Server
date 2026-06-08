/*
    This file is part of the HeavenMS MapleStory Server
    Copyleft (L) 2016 - 2019 RonanLana

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation version 3 as published by
    the Free Software Foundation. You may not use, modify or distribute
    this program under any other version of the GNU Affero General Public
    License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/* NPC: Agent E (9000036)
    Victoria Road : Henesys
	
    Refining NPC:
    * Accessories refiner
        * 
        * @author RonanLana
*/

var status = -1;
var selectedType = -1;
var selectedItem = -1;
var item;
var items;
var mats;
var matQty;
var cost;
var qty = 1;
var equip;
var maxEqp = 0;

function start() {
    const GameConfig = Java.type('org.gms.config.GameConfig');
    if (!GameConfig.getServerBoolean("use_enable_custom_npc_script")) {
        cm.sendOk("嗨，我是 #b#p" + cm.getNpc() + "##k。");
        cm.dispose();
        return;
    }

    cm.getPlayer().setCS(true);
    var selStr = "你好呀，我是 #b饰品锻造师#k！我的手艺可是远近闻名的，打造出来的饰品不仅外观精美，属性更是和原版一模一样！我只收取一些制作所需的#b材料#k，还有一点手工费哦。你想打造哪一类饰品呢？#b";
    var options = ["吊坠", "脸部装饰", "眼部装饰", "腰带 & 勋章", "戒指"/*,"#t4032496#"*/];
    for (var i = 0; i < options.length; i++) {
        selStr += "\r\n#L" + i + "# " + options[i] + "#l";
    }
    cm.sendSimple(selStr);
}

function action(mode, type, selection) {
    status++;
    if (mode != 1) {
        cm.dispose();
        return;
    }
    if (status == 0) {
        if (selection == 0) { //pendants 吊坠
            var selStr = "嗯，吊坠的话，我这里有这些款式可以选择：#b";
            items = [1122018, 1122007, 1122001, 1122003, 1122004, 1122006, 1122002, 1122005, 1122058];
            for (var i = 0; i < items.length; i++) {
                selStr += "\r\n#L" + i + "##t" + items[i] + "##b";
            }
        } else if (selection == 1) { //face accessory 脸部装饰
            var selStr = "哦？脸部装饰吗？看这里，都给你整理好了：#b";
            items = [1012181, 1012182, 1012183, 1012184, 1012185, 1012186, 1012108, 1012109, 1012110, 1012111];
            for (var i = 0; i < items.length; i++) {
                selStr += "\r\n#L" + i + "##t" + items[i] + "##b";
            }
        } else if (selection == 2) { //eye accessory 眼部装饰
            var selStr = "眼睛不太舒服吗？没问题，你想让我给你打造哪一款眼镜呢？#b";
            items = [1022073, 1022088, 1022103, 1022089, 1022082];
            for (var i = 0; i < items.length; i++) {
                selStr += "\r\n#L" + i + "##t" + items[i] + "##b";
            }
        } else if (selection == 3) { //belt & medal 腰带 & 勋章
            var selStr = "嗯……要说腰带和勋章的话，这事就有点特殊了。这些饰品的材料相似度很高，我也没法保证锻造完成后会出现具体哪一款成品哦。你还想尝试碰碰运气吗？";
            items = [];
            maxEqp = 0;

            for (var x = 1132005; x < 1132017; maxEqp++, x++) {
                items[maxEqp] = x;
            }

            for (var x = 1142000; x < 1142102; maxEqp++, x++) {
                items[maxEqp] = x;
            }

            for (var x = 1142107; x < 1142121; maxEqp++, x++) {
                items[maxEqp] = x;
            }

            for (var x = 1142122; x < 1142143; maxEqp++, x++) {
                items[maxEqp] = x;
            }
            selStr += "\r\n#L0#【尝试锻造】#b"; // 修正了原脚本的i未定义问题，改为固定L0

        } else if (selection == 4) { //ring refine 戒指锻造
            var selStr = "戒指啊？这可是我的拿手好戏，你自己看看款式吧！#b";
            items = [1112407, 1112408, 1112401, 1112413, 1112414, 1112405, 1112402];

            for (var i = 0; i < items.length; i++) {
                selStr += "\r\n#L" + i + "##t" + items[i] + "##b";
            }

        }/*else if (selection == 5) { //make necklace
            var selStr = "Need to make #t4032496#?#b";
            items = [4032496];
            for (var i = 0; i < items.length; i++)
                selStr += "\r\n#L" + i + "##t" + items[i] + "##l";
        }*/
        selectedType = selection;
        cm.sendSimple(selStr);
    } else if (status == 1) {
        if (selectedType != 3) {
            selectedItem = selection;
        }

        if (selectedType == 0) { //pendant refine 吊坠锻造
            var matSet = [[4003004, 4030012, 4001356, 4000026], [4000026, 4001356, 4000073, 4001006], [4001343, 4011002, 4003004, 4003005], [4001343, 4011006, 4003004, 4003005], [4000091, 4011005, 4003004, 4003005], [4000091, 4011001, 4003004, 4003005], [4000469, 4011000, 4003004, 4003005], [4000469, 4011004, 4003004, 4003005], [1122007, 4003002, 4000413]];
            var matQtySet = [[20, 20, 5, 1], [5, 5, 10, 1], [10, 2, 20, 4], [10, 1, 20, 4], [15, 3, 30, 6], [15, 3, 30, 6], [20, 5, 20, 8], [20, 4, 40, 8], [1, 1, 1]];
            var costSet = [150000, 500000, 200000, 200000, 300000, 300000, 400000, 400000, 2500000];
        } else if (selectedType == 1) { //face accessory refine 脸部装饰锻造
            var matSet = [[4006000, 4003004], [4006000, 4003004, 4000026], [4006000, 4003004, 4000026, 4000082, 4003002], [4006000, 4003005], [4006000, 4003005, 4000026], [4006000, 4003005, 4000026, 4000082, 4003002], [4001006, 4011008], [4001006, 4011008], [4001006, 4011008], [4001006, 4011008]];
            var matQtySet = [[5, 5], [5, 5, 5], [5, 5, 5, 5, 1], [5, 5], [5, 5, 5], [5, 5, 5, 5, 1], [1, 1], [1, 1], [1, 1], [1, 1]];
            var costSet = [100000, 200000, 300000, 125000, 250000, 375000, 500000, 500000, 500000, 500000, 25000, 25000, 25000, 25000];
        } else if (selectedType == 2) { //eye accessory refine 眼部装饰锻造
            var matSet = [[4001006, 4003002, 4000082, 4031203], [4001005, 4011008], [4001005, 4011008], [4001005, 4011008, 4000082], [4001006, 4003002, 4003000, 4003001]];
            var matQtySet = [[2, 2, 5, 10], [3, 2], [4, 3], [5, 3, 10], [2, 2, 10, 5]];
            var costSet = [250000, 250000, 300000, 400000, 200000];
        } else if (selectedType == 3) { //belt & medals refine 腰带 & 勋章锻造
            var matSet = [[4001006, 4003005, 4003004], [7777, 7777]];
            var matQtySet = [[2, 5, 10], [7777, 7777]];
            var costSet = [15000, 7777];
        } else if (selectedType == 4) { //ring refine 戒指锻造
            var matSet = [[4003001, 4001344, 4006000], [4003001, 4001344, 4006000], [4021004, 4011008], [4011008, 4001006], [1112413, 2022039], [1112414, 4000176], [4011007, 4021009]];
            var matQtySet = [[2, 2, 2], [2, 2, 2], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1]];
            var costSet = [10000, 10000, 10000, 20000, 15000, 15000, 10000];
        }/*else if (selectedType == 5) { //necklace refine
            var matSet = [[4011007, 4011008, 4021009]];
            var matQtySet = [[1, 1, 1]];
            var costSet = [10000];
        }*/

        if (selectedType == 3) {
            selectedItem = Math.floor(Math.random() * maxEqp);
            item = items[selectedItem];
            mats = matSet[0];
            matQty = matQtySet[0];
            // 修改点1：腰带&勋章金币费用×10
            cost = costSet[0] * 100;
        } else {
            item = items[selectedItem];
            mats = matSet[selectedItem];
            matQty = matQtySet[selectedItem];
            // 修改点2：其他品类金币费用×10
            cost = costSet[selectedItem] * 10;
        }

        var prompt = "你想要我为你打造";
        if (selectedType != 3) {
            if (qty == 1) {
                prompt += "一件 #b#t" + item + "##k 对吗？";
            } else {
                prompt += "#b" + qty + " 件 #t" + item + "##k 对吗？";
            }
        } else {
            prompt += "一件 #b腰带#k 或者 #b勋章#k 对吗？";
        }

        prompt += " 好的！要打造这件物品，我需要一些材料，另外请确保你的#b背包有空闲格子#k哦！#b";
        if (mats instanceof Array) {
            for (var i = 0; i < mats.length; i++) {
                prompt += "\r\n#i" + mats[i] + "# " + (matQty[i] * qty) + " 个 #t" + mats[i] + "#";
            }
        } else {
            prompt += "\r\n#i" + mats + "# " + (matQty * qty) + " 个 #t" + mats + "#";
        }
        if (cost > 0) {
            // 此处展示的金币数会自动同步×10后的cost，无需额外修改
            prompt += "\r\n#i4031138# " + (cost * qty) + " 金币";
        }
        cm.sendYesNo(prompt);
    } else if (status == 2) {
        // 此处校验和扣除的金币数会自动同步×10后的cost，无需额外修改
        if (cm.getMeso() < (cost * qty)) {
            cm.sendOk("这是我制作物品的手工费，概不赊账哦！");
        } else {
            var complete = true;
            if (mats instanceof Array) {
                for (var i = 0; complete && i < mats.length; i++) {
                    if (!cm.haveItem(mats[i], matQty[i] * qty)) {
                        complete = false;
                    }
                }
            } else if (!cm.haveItem(mats, matQty * qty)) {
                complete = false;
            }

            if (!complete) {
                cm.sendOk("你确定你带齐了所有需要的材料吗？再检查一下背包哦！");
            } else {
                if (cm.canHold(item, qty)) {
                    if (mats instanceof Array) {
                        for (var i = 0; i < mats.length; i++) {
                            cm.gainItem(mats[i], -(matQty[i] * qty));
                        }
                    } else {
                        cm.gainItem(mats, -(matQty * qty));
                    }
                    // 此处扣除的金币数会自动同步×10后的cost，无需额外修改
                    cm.gainMeso(-(cost * qty));

                    cm.gainItem(item, qty);
                    cm.sendOk("物品已经打造完成啦！快拿去试试这件精美的成品吧。");
                } else {
                    cm.sendOk("你的背包已经没有空闲格子了，先清理一下吧。");
                }
            }
        }

        cm.dispose();
    }
}