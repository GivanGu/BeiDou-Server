/**
 * @description 在线角色传送功能实现
 * 支持跨频道传送至目标角色位置，自动过滤自身角色，并对副本玩家做特殊处理
 * @author 吃瓜群众
 */

// 导入所需Java类
const ArrayList = Java.type('java.util.ArrayList');
const HashMap = Java.type('java.util.HashMap');
const Server = Java.type('org.gms.net.server.Server');
const Client = Java.type('org.gms.client.Client');
var allCharacters;

function start() {
    levelStart();
}

/**
 * @description 显示在线角色列表（过滤自身，按IP分组显示）
 */
function levelStart() {
    var worldS = Server.getInstance().getWorlds();
    var text = "#b在线总人数：";
    var text2 = "";
    var index = 0;
    allCharacters = new ArrayList();
    // 新增：创建IP分组Map，key=纯IP地址，value=角色列表
    var ipGroupMap = new HashMap();
    const self = cm.getPlayer();
    const selfId = self.getId();

    // 第一步：遍历所有角色，按IP分组存储
    for (let i = 0; i < worldS.size(); i++) {
        var world = worldS.get(i);
        var characters = world.getPlayerStorage().getAllCharacters();
        for (let j = 0; j < characters.size(); j++) {
            var character = characters.get(j);
            if (character.getId() === selfId) {
                continue; // 过滤自身
            }

            // 提取并格式化IP（去除前缀/端口，只保留纯IP）
            var client = character.getClient();
            var remoteAddress = client.getRemoteAddress().toString();
            // 处理IP格式：如 "/192.168.1.100:5555" → "192.168.1.100"
            var pureIp = remoteAddress.replace(/^\/|:\d+$/g, '');

            // 将角色添加到对应IP的列表中
            if (!ipGroupMap.containsKey(pureIp)) {
                ipGroupMap.put(pureIp, new ArrayList());
            }
            ipGroupMap.get(pureIp).add(character);
        }
    }

    // 第二步：遍历IP分组，拼接显示文本（同IP角色聚合）
    const ipSet = ipGroupMap.keySet();
    const ipIterator = ipSet.iterator();
    while (ipIterator.hasNext()) {
        var ip = ipIterator.next();
        var roleList = ipGroupMap.get(ip);
        // 显示IP标题（醒目样式）
        text2 += `-------------------------------#n#r\r\n`;

        // 遍历当前IP下的所有角色
        for (let k = 0; k < roleList.size(); k++) {
            var character = roleList.get(k);
            var name = character.getName();
            var job = character.getJob();
            var level = character.getLevel();
            var channel = character.getClient().getChannel();
            var map = character.getMap();
            var mapName = map.getMapName();

            // 拼接角色信息
            text2 += `#L${index}#` +
                `#r${name}--#b#e[ ${channel}线- ${mapName} ]  #n#r #l \r\n\r\n`;
            // 关联IP（可选：若需单独显示IP可保留）
            text2 += `\t\tIP：[${ip}] - ${level}级-${job.getName()}#l\r\n`;
            index++;
            allCharacters.add(character);
        }
    }

    // 拼接总人数并发送列表
    text += `#r${index}#b 人：#n#l\r\n`;
    text += text2;
    cm.sendNextSelectLevel("SelectPlayer", text);
}

/**
 * @description 处理角色选择，执行跨频道传送（支持副本地图）
 * @param {String} index 选中的角色索引
 */
function levelSelectPlayer(index) {
    const targetIndex = parseInt(index, 10);
    const target = allCharacters.get(targetIndex);
    const self = cm.getPlayer();
    const client = cm.getClient();
    const targetPos = target.getPosition();
    console.info("位置===》:" + targetPos);
    // 校验目标玩家状态
    if (!target || !target.isLoggedIn()) {
        cm.sendOk("目标玩家不存在或已下线。");
        cm.dispose();
        return;
    }
    if (target.isBanned() || target.getTrade() !== null || target.isChangingMaps()) {
        cm.sendOk("目标玩家当前无法接收传送请求。");
        cm.dispose();
        return;
    }

    // 获取目标玩家的地图和频道信息
    const targetMap = target.getMap();
    const targetChannel = target.getClient().getChannel();
    const currentChannel = client.getChannel();
    const targetEim = targetMap.getEventInstance(); // 目标所在副本实例（可能为null）

    // 执行传送逻辑
    if (targetChannel !== currentChannel) {
        // 跨频道传送：先切换频道，再处理副本/普通地图
        client.changeChannel(targetChannel, (c, newCh) => {
            传送到指定玩家(self, target, targetEim, targetMap, targetPos);
        });
    } else {
        传送到指定玩家(self, target, targetEim, targetMap, targetPos);
    }
}

function 传送到指定玩家(self, target, targetEim, targetMap, targetPos) {
    try {
        if (targetEim) {
            传送到副本(self, target, targetEim, targetMap, targetPos);
        } else {
            传送普通地图(self, target, targetMap, targetPos);
        }
    } catch (e) {
        cm.sendOk(`跨频道传送失败：${e.message}`);
    } finally {
        cm.dispose();
    }
}

function 传送普通地图(self, target, targetMap, targetPos) {
    self.changeMap(targetMap, targetPos);
}

function 传送到副本(self, target, targetEim, targetMap, targetPos) {
    // 副本场景：通过目标副本实例获取地图
    const instanceMap = targetEim.getMapInstance(targetMap.getId());
    if (!instanceMap) {
        cm.sendOk("目标副本地图实例已失效。");
        return;
    }
    const portal = instanceMap.findClosestPortal(target.getPosition());
    cm.forceChangeMap(instanceMap, targetPos);
}