
/**
    血勋章

**/

//  主要道具
const itemSet = [
    1142085,
    1142086,
    1142087,
    1142088,
    1142089
]


//  需要的材料
const matSet = [
    [4021000, 4021006, 4021002, 4021004],
    [4021000, 4021006, 4021002, 4021004, 1142085],
    [4021008, 4021001, 4021003, 4021005, 4021007, 1142086],
    [4011007, 4005000, 4005001, 4005002, 4005003, 1142087],
    [4000152, 4000151, 4005004, 4011007, 4021009, 1142088],
]

// 需要的数量
const matQtySet = [
    [1, 1, 1, 1],
    [4, 4, 4, 4, 1],
    [8, 8, 8, 8, 8, 1],
    [10, 10, 10, 10, 10, 1],
    [15, 15, 15, 15, 15, 1],
]


//  需要的金币
const costSet = [
    500000,
    5000000,
    10000000,
    20000000,
    30000000
]



// 变量
var status = 0;
var selectedItem;
var item;
var req;
var cost;


function start() {
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode === -1 || mode === 0) {
        cm.dispose();
        return;
    }
    status++;    

    if (status == 1) {
        var add = "选择你要的装备\r\n";
        for (var i = 0; i < itemSet.length; i++) {
            add += "\r\n#L" + i + "##v " + itemSet[i] + "##z";
            add += itemSet[i] + "#\r\n";
        };

        cm.sendSimple(add, 2);
    } else if (status == 2) {

        selectedItem = selection;

        item = itemSet[selectedItem];
        mats = matSet[selectedItem];
        matQty = matQtySet[selectedItem];
        cost = costSet[selectedItem];

        var bdd = "你想要     ";
        bdd += "#i" + item + "# " + " #z" + item + "#";
        bdd += "\r\n 你需要 :\r\n";

        if (mats instanceof Array) {
            for (var i = 0; i < mats.length; i++) {
                bdd += "\r\n#i" + mats[i] + "# " + matQty[i] + "个 #t" + mats[i] + "#";
            }
        } else {
            bdd += "\r\n#i" + mats + "# " + matQty + "个 #t" + mats + "#";
        }
        if (cost > 0)
            bdd += "\r\n#i4031138# " + cost + " 金币";

        cm.sendYesNo(bdd);
    } else if (status == 3) {
        var complete = true;

        if (!cm.canHold(item, 1)) {
            cm.sendOk("检查背包.");
            cm.dispose();
            return;
        }
        else if (cm.getMeso() < cost) {
            complete = false;
            cm.sendOk("#b 金币不足.");
            cm.dispose();
            return;
        } else {
            if (mats instanceof Array) {
                for (var i = 0; complete && i < mats.length; i++)
                    if (!cm.haveItem(mats[i], matQty[i]))
                        complete = false;
            }
            else if (!cm.haveItem(mats, matQty))
                complete = false;
        }

        if (!complete) {
            cm.sendOk("物品不对.");
        } else {
            if (mats instanceof Array) {
                for (var i = 0; i < mats.length; i++) {
                    cm.gainItem(mats[i], -matQty[i]);
                }
            } else {
                cm.gainItem(mats, -matQty);
            }
            cm.gainMeso(-cost);
            cm.gainItem(item);
            cm.sendOk("#b 制作完成，祝贺你");
            cm.dispose();
        }
        cm.dispose();
    }
}

function showItemSelection() {
    let selectionText = "请选择你要制作的装备：\r\n";
    
    ITEM_SET.forEach((itemId, index) => {
        selectionText += `\r\n#L${index}##v${itemId}##z${itemId}#`;
    });
    
    cm.sendSimple(selectionText);
}