# 1.12.2 旧版命令覆盖

## 结果

| 项 | 值 |
|---|---:|
| 1.12.2 根命令 | 64 |
| 有专用/分组表单 | **64** |
| 覆盖率 | **100%** |
| 旧版工具标签 | 34 |

## 表单结构

### 单命令表单

```text
testfor / blockdata / entitydata / replaceitem / give
testforblock / testforblocks / achievement
trigger / setidletimeout / save / stats
scoreboard / execute / advancement / clear
worldborder / spreadplayers / title / particle
summon / gamerule / xp / tellraw
effect / enchant
```

### 分组表单

| 标签 | 覆盖命令 |
|---|---|
| sound | playsound / stopsound |
| teleport | tp / teleport |
| admin | ban / ban-ip / banlist / deop / kick / op / pardon / pardon-ip / whitelist |
| world | time / weather / difficulty |
| simple | help / list / seed / reload / save-all / save-off / save-on / stop / toggledownfall / me / say / tell |
| gamemode | gamemode / defaultgamemode |
| block | setblock / fill / clone |
| misc | function / recipe / locate / spawnpoint / setworldspawn / kill / debug |

## 说明

- 分组表单通过动作下拉切换命令。
- 1.12.2 仍使用 Legacy 原始构建器作为兜底。
- OOC 生成器独立于旧版工具。
- 复杂命令字段仍在继续深化。

## 验证

- `packs/1.12.2/commands.json`：64 个根命令
- 旧版工具标签：34
- 覆盖：64 / 64
- 单元测试：270
