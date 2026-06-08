var status = -1;
var text;
//Start
function start(mode, type, selection) {

	if (CheckStatus(mode)) {

		if (status == 0) {

			text = "冒险世界的怪物都非常祥和，不知道发生了什么，位于#b魔法密林郊区#k的猴子森林！";
			text += "猴子们受到黑暗力量的影响一个接一个的死去，并且产生变异，对人类进行无差别的攻击！这可能还只是个开始。";
			text += "\r\n\r\n你愿意过去帮忙吗？完成之后将获得一定的#r奖励#k哦！"
			text += "\r\n\r\n接受任务我将送你过去抓吗喽！"
			qm.sendAcceptDecline(text);

		} else if (status == 1) {

			if (qm.getLevel() < 40) {
				qm.sendOk("还是等你40级以后再去吧，你现在去会死翘翘的。");
			} else if (qm.getMapId() == 300000012) {
				qm.sendOk("等您刑满释放了我再来接您！");
			} else {
				if (qm.getMapId() != 100040103) qm.warp(100040103);

				qm.sendOk("谢谢您，请帮我消灭200只，但愿这样可以让冒险岛世界的黑暗气息能有效地被遏制一些。");
				qm.forceStartQuest();
			}

			qm.dispose();

		}
	} else {
		qm.forceCompleteQuest();
		qm.sendOk("好吧，我先找别人帮忙吧，预测明天那些猴子还会更多，明天有时间再去吧！");
		qm.dispose();
	}
}

function end(mode, type, selection) {

	if (CheckStatus(mode)) {

		if (status == 0) {
			//第一层对话
			qm.sendOk("天呐您这么快就消灭了200只，冒险岛世界有救了！谢谢您~！");
			qm.forceCompleteQuest();
			qm.gainItem(2430033, 2);
			qm.gainItem(4310000, 1);

			// qm.message("恭喜获得：音符 *1 , 北斗指导书 *2");
		} else {

			//最后一层对话完继续循环至此，退出结束
			qm.dispose();
		}
	}

}



function CheckStatus(mode) {

	if (mode == -1) {
		qm.dispose();
		return false;
	}

	if (mode == 1) {
		status++;
	} else {
		status--;
	}
	if (status == -1) {
		qm.dispose();
		return false;
	}
	return true;

}
