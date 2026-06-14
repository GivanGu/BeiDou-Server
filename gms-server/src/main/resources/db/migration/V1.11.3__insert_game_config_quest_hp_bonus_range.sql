-- 完成任务增加HP的最小值
INSERT INTO `game_config`(`config_type`, `config_sub_type`, `config_clazz`, `config_code`, `config_value`, `config_desc`, `update_time`)
SELECT 'server', 'Game Mechanics', 'java.lang.Integer', 'quest_complete_hp_bonus_min', '3', 'quest_complete_hp_bonus_min', '2026-06-13 00:00:00'
WHERE NOT EXISTS (
    SELECT 1 FROM `game_config` WHERE `config_code` = 'quest_complete_hp_bonus_min'
);

-- 完成任务增加HP的最大值
INSERT INTO `game_config`(`config_type`, `config_sub_type`, `config_clazz`, `config_code`, `config_value`, `config_desc`, `update_time`)
SELECT 'server', 'Game Mechanics', 'java.lang.Integer', 'quest_complete_hp_bonus_max', '10', 'quest_complete_hp_bonus_max', '2026-06-13 00:00:00'
WHERE NOT EXISTS (
    SELECT 1 FROM `game_config` WHERE `config_code` = 'quest_complete_hp_bonus_max'
);

-- 中文内容 - 最小值
INSERT INTO `lang_resources`(`lang_type`, `lang_base`, `lang_code`, `lang_value`, `lang_extend`)
SELECT 'zh-CN', 'game_config', 'quest_complete_hp_bonus_min', '完成任务增加HP的最小值', NULL
WHERE NOT EXISTS (
    SELECT 1 FROM `lang_resources` WHERE `lang_type` = 'zh-CN' AND `lang_code` = 'quest_complete_hp_bonus_min'
);

-- 英文内容 - 最小值
INSERT INTO `lang_resources`(`lang_type`, `lang_base`, `lang_code`, `lang_value`, `lang_extend`)
SELECT 'en-US', 'game_config', 'quest_complete_hp_bonus_min', 'Minimum HP bonus on quest completion', NULL
WHERE NOT EXISTS (
    SELECT 1 FROM `lang_resources` WHERE `lang_type` = 'en-US' AND `lang_code` = 'quest_complete_hp_bonus_min'
);

-- 中文内容 - 最大值
INSERT INTO `lang_resources`(`lang_type`, `lang_base`, `lang_code`, `lang_value`, `lang_extend`)
SELECT 'zh-CN', 'game_config', 'quest_complete_hp_bonus_max', '完成任务增加HP的最大值', NULL
WHERE NOT EXISTS (
    SELECT 1 FROM `lang_resources` WHERE `lang_type` = 'zh-CN' AND `lang_code` = 'quest_complete_hp_bonus_max'
);

-- 英文内容 - 最大值
INSERT INTO `lang_resources`(`lang_type`, `lang_base`, `lang_code`, `lang_value`, `lang_extend`)
SELECT 'en-US', 'game_config', 'quest_complete_hp_bonus_max', 'Maximum HP bonus on quest completion', NULL
WHERE NOT EXISTS (
    SELECT 1 FROM `lang_resources` WHERE `lang_type` = 'en-US' AND `lang_code` = 'quest_complete_hp_bonus_max'
);

-- 更新原有config_desc，将其说明改为更准确
UPDATE `game_config` SET `config_desc` = 'quest_complete_hp_bonus' WHERE `config_code` = 'quest_complete_hp_bonus';

-- 更新原有中文描述，提示用户可以调节范围
UPDATE `lang_resources` SET `lang_value` = '完成任务是否随机增加MaxHP(范围可在 quest_complete_hp_bonus_min/max 中调节)' WHERE `lang_type` = 'zh-CN' AND `lang_code` = 'quest_complete_hp_bonus';

-- 更新原有英文描述
UPDATE `lang_resources` SET `lang_value` = 'Whether to gain random MaxHP on quest completion (range configurable via quest_complete_hp_bonus_min/max)' WHERE `lang_type` = 'en-US' AND `lang_code` = 'quest_complete_hp_bonus';
