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
/* Dalair
    Medal NPC.
 
        NPC Equipment Merger:
        * @author Ronan Lana
 */

var status;
var mergeFee = 100000000;
var name;

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1) {
        cm.dispose();
    } else {
        if (mode == 0 && type > 0) {
            cm.dispose();
            return;
        }
        if (mode == 1) {
            status++;
        } else {
            status--;
        }

        if (status == 0) {
            
            // 写死不允许使用长辈合成系统
            cm.sendOk("装备合并系统目前不可用。");
            return;

            const GameConfig = Java.type('org.gms.config.GameConfig');
            if (!GameConfig.getServerBoolean("use_starter_merge")) {
                cm.sendOk("装备合并系统目前不可用。");
                cm.dispose();
                return;
            }

            var levelLimit = !cm.getPlayer().isCygnus() ? 180 : 110;
            var selStr = "勋章排名系统目前不可用...不过，我可以为您提供 #b装备合并#k 服务！";

            const MakerProcessor = Java.type('org.gms.client.processor.action.MakerProcessor');
            if (!GameConfig.getServerBoolean("use_starter_merge") && (cm.getPlayer().getLevel() < levelLimit || MakerProcessor.getMakerSkillLevel(cm.getPlayer()) < 3)) {
                selStr += "但是，您必须拥有 #r制作技能等级3#k，并且至少达到 #r110级#k（骑士团）或 #r180级#k（其他职业），同时准备 #r" + cm.numberWithCommas(mergeFee) + " 金币#k 才能使用此服务。";
                cm.sendOk(selStr);
                cm.dispose();
            } else if (cm.getMeso() < mergeFee) {
                selStr += "很抱歉，使用此服务需要支付 #r" + cm.numberWithCommas(mergeFee) + " 金币#k，但您目前似乎没有足够的金币...请稍后再来吧。";
                cm.sendOk(selStr);
                cm.dispose();
            } else {
                selStr += "只需支付 #r" + cm.numberWithCommas(mergeFee) + " 金币#k，就可以将背包中不需要的装备合并到您当前装备的装备上，从而获得属性加成！加成的属性基于用于合并的装备属性！";
                cm.sendNext(selStr);
            }
        } else if (status == 1) {
            selStr = "#r警告#b：请确保您要用于合并的装备放在您选定装备的 #r后面几个格子#b。#k选定装备 #b后面#k 的所有同名装备都会被彻底合并。\r\n\r\n注意：通过合并获得属性加成的装备将变成 #r不可交易#k 状态。\r\n\r\n请输入您要合并的装备名称：";
            cm.sendGetText(selStr);
        } else if (status == 2) {
            name = cm.getText();

            if (cm.getPlayer().mergeAllItemsFromName(name)) {
                cm.gainMeso(-mergeFee);
                cm.sendOk("合并完成！感谢您使用本服务，祝您享受新的装备属性。");
            } else {
                cm.sendOk("您的 #b装备#k 栏中没有找到 #b'" + name + "'#k 这件装备！");
            }

            cm.dispose();
        }
    }
}