# 旧版本图标与中文名

## 目标

1.13–1.20.4 的部分注册表 ID 与 26.3 不同，界面回退英文 ID 或首字母。

本轮通过别名映射解决，不重建图集。

## 图标别名

| 旧 ID | 当前图集 |
|---|---|
| grass | short_grass |
| grass_path | dirt_path |
| sign | oak_sign |
| wall_sign | oak_sign |
| rose_red | red_dye |
| dandelion_yellow | yellow_dye |
| cactus_green | green_dye |
| scute | turtle_scute |
| zombie_pigman_spawn_egg | zombified_piglin_spawn_egg |
| zombie_pigman | zombified_piglin |
| boat | oak_boat |
| chest_boat | oak_chest_boat |
| chain | iron_chain |
| sweeping | sweeping_edge |
| tropical_fish.* | tropical_fish |
| villager.* | villager |
| potion | potion |

## 中文名

已补：

- 草
- 土径
- 告示牌
- 墙上的告示牌
- 玫瑰红染料
- 蒲公英黄染料
- 仙人掌绿染料
- 鳞甲
- 僵尸猪人刷怪蛋
- 僵尸猪人
- 船 / 运输船
- 药水
- 锁链
- 横扫之刃
- 热带鱼
- 村民职业：盔甲匠 / 屠夫 / 制图师 / 牧师 / 农民 / 渔夫 / 制箭师 / 皮匠 / 图书管理员 / 傻子 / 牧羊人 / 工具匠 / 武器匠

## 覆盖

| 版本 | 缺失图标 |
|---|---:|
| 1.13.2 | 0 |
| 1.14.4 | 0 |
| 1.16.5 | 0 |
| 1.18.2 | 0 |
| 1.20.4 | 0 |

## 验证

- 单元测试：276
- 别名测试：`mcAssets.test.ts`
- 1.16.5 replaceitem NBT 表单冒烟
