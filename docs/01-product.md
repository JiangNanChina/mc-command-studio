# 01 · 产品定义

## 1. 一句话

**MC 指令工坊**是一个 Windows 桌面程序：用表单拼出 Minecraft Java 版命令，实时复制到游戏，或生成放置命令方块的 `/setblock`。

它不是网页、不需要登录、不需要浏览器或本地服务器；安装后双击即用，断网也能编辑。

## 2. 用户与场景

| 用户 | 典型任务 | 当前痛点 |
|---|---|---|
| 地图 / 小游戏作者 | 批量生成 `give`、`summon`、`setblock`、`execute` | 记不住 NBT / 组件语法，复制命令后反复改 |
| 命令方块玩家 | 做出可复用的命令方块逻辑 | 命令方块 NBT 转义容易错，链式朝向难排 |
| 数据包入门者 | 把命令保存成项目、导出函数 | 没有本地工程，重启就丢 |
| 服主 | 给玩家发物品、做活动奖励 | 物品组件 / 选择器写法复杂 |

## 3. 差异化

| 维度 | CBC（参考站） | MC 指令工坊 |
|---|---|---|
| 形态 | 网页，需联网与登录 | Windows 安装包，离线可用 |
| 版本 | 1.10 / 1.12 / 1.13 | 26.x 数据驱动，后续扩展到 1.12.2–1.21.x |
| 命令覆盖 | 精选命令 + NBT 单元 | 官方命令树 94 根命令 + 通用构建器 |
| 编辑方式 | 表单 → 命令 | 表单 → 命令；预留命令 → 表单 |
| 命令方块 | 有 OOC / 方案 | `/setblock` 生成 + 链式布局（P1） |
| 发布 | 网页更新 | 安装包 + 自动更新 + 便携版 |

## 4. 范围

### P0（首个可发布版，已实现骨架）

- 26.3 数据包：94 根命令、1,197 字面量、59 参数类型、1,658 物品、1,286 方块。
- 1.21.1 试验数据包：83 根命令、1,333 物品、1,060 方块，可在顶栏切换。
- 1.20.4 数据包：82 根命令、1,312 物品、686 方块，NBT 引擎；NBT give/item、loot、32 个兼容表单与召唤预设。
- 数据包工作区：独立于命令编辑，多函数管理、load/tick 标签、文件预览与 zip 导出。
- 专用表单：`give`、`summon`、`setblock`、`execute`、`tp`、`effect`、`fill`、`clone`、`enchant`、`xp`、`tellraw`、`title`、`playsound`、`stopsound`、`bossbar`、`scoreboard`、`particle`、`time`、`weather`、`difficulty`、`tag`、`clear`、`gamerule`、`worldborder`、`team`、`spawnpoint`、`setworldspawn`、`forceload`、`attribute`、`advancement`、`function`、`schedule`、`item`、`data`、`loot`；`setblock` 支持方块状态与方块实体 NBT。
- 可视化资源库：26.3 官方中文名称与图标，物品/方块/效果/附魔/实体/声音统一为图标网格选择，支持中文名搜索。
- 富文本可视化：tellraw/title 多段文本、颜色、样式、点击/悬停、标题时序、实时预览。
- 声音可视化：1,991 个声音、来源、目标、坐标、音量/音调/最小音量、stopsound 三种停止范围。
- BOSS 栏可视化：创建/更新/移除、颜色/样式/数值/可见性/玩家列表、预览。
- 命令方块链：最多 64 个脉冲/连锁/循环方块，按方向自动偏移坐标，生成整链 `/setblock`。
- `execute` 执行链：as/at/positioned/align/anchored/facing/rotated/in/if/unless/store/raw + run，可排序。
- 数据包导出：单命令或多行命令导出为 `.zip`，包含 `pack.mcmeta`、`.mcfunction` 与可选 load/tick 标签。
- `tp`：坐标/实体目的地、可选朝向；`effect`：give/clear、固定时长或永久、等级、隐藏粒子；`fill`/`clone`：区域、方块状态、模式、过滤；`enchant`/`xp`：附魔、经验。
- 撤销/重做：所有表单、通用构建器、项目名称、命令方块设置；Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y，最多 100 步。
- `give` 13 类组件（自定义名称、默认名称、描述、附魔、无法破坏、堆叠、耐久、伤害、稀有度、光效、模型数据、自定义数据、raw）。
- `give` 文本导入：粘贴命令还原为表单，未知组件保留为 raw。
- 更新公告：只展示当前版本的新增/改进/修复，历史版本跳转 GitHub Releases，不显示已知问题。
- 品牌：命令方块主题应用图标、安装包图标与界面 Logo。
- 通用构建器：未覆盖命令仍保留官方命令树作为高级兜底。
- 实时输出 + 基础校验 + 复制；命令方块模式生成 `/setblock`。
- 项目保存 / 打开 / 自动保存 / 崩溃恢复；最近项目。
- 深色/浅色主题、设置、诊断导出、本地日志。
- NSIS 安装包 + 便携版；electron-updater 自动更新与发布流水线。
- 单元测试 196 个；Electron 冒烟测试覆盖公告、give/导入/summon/setblock/tp/effect/fill/clone/enchant/xp/tellraw/title/playsound/stopsound/bossbar（含 get/list）/particle/time/weather/difficulty/tag/clear/gamerule/worldborder/team（含前缀/高级显示名）/spawnpoint/setworldspawn/forceload/attribute/advancement/function/schedule/item/data（含 modify/from）/loot/scoreboard（含 objectives modify）/execute/命令方块链/数据包工作区（含谓词/进度/战利品表结构化）/撤销重做/命令方块。

### P1（现代版 MVP）

- 20+ 专用参数编辑器：NBT、方块谓词、物品谓词、文本组件、粒子、战利品表、对话框。
- 单元体系：物品、方块、实体、文本、附魔组、效果组可命名引用。
- `execute` 执行链可视化与执行链导入。
- 数据包导出（`pack.mcmeta` + `.mcfunction` + `load` / `tick` 标签）。
- 链式命令方块布局与朝向计算。

### P2（全版本）

- 1.13–1.20.4：NBT 物品/实体编辑器与旧版 `execute`。
- 1.12.2：独立 legacy 引擎、OOC（掉落方块 / 命令方块矿车）。
- 插件/模组命令模板、RCON 游戏内验证、分享与云同步。

## 5. 非目标（当前轮）

- 不做网页版、不做服务器端、不做账号系统。
- 不内置游戏本体、材质、语言文件。
- 不保证生成的命令在所有服务端插件环境下语义一致。

## 6. 成功指标

| 指标 | 目标 |
|---|---|
| 从打开到复制一条 `give` | ≤ 60 秒 |
| 94 个根命令可进入并生成文本 | 100% |
| 26.3 数据包加载 | ≤ 1 秒（本机实测约 0.2 秒） |
| 冷启动到可交互 | ≤ 3 秒（本机实测约 2 秒） |
| 命令输出与游戏语法偏差 | 高频命令 0 已知错误 |
| 崩溃后可恢复 | 自动保存 ≤ 4 秒 + 下次启动提示 |

## 7. 当前实现状态

| 能力 | 状态 |
|---|---|
| 26.3 数据包 + 通用构建器 | ✅ |
| `give` / `summon` / `setblock` / `execute` / `tp` / `effect` / `fill` / `clone` / `enchant` / `xp` 专用表单 | ✅ |
| `give` 文本导入 | ✅ 组件无法解析时保留 raw |
| 撤销 / 重做 | ✅ 全局 100 步 + 快捷键 |
| 可视化资源选择 | ✅ 中文名 + 图标；物品/方块/效果/附魔/实体 |
| 富文本 tellraw/title | ✅ 颜色/样式/点击/悬停/时序/预览 |
| 声音 playsound/stopsound | ✅ 1,991 声音 + 中文名/图标/来源/音量 |
| BOSS 栏 bossbar | ✅ 创建/更新/移除 + 颜色/样式/数值/玩家 |
| 计分板 scoreboard | ✅ 目标/显示位置/玩家分数/运算 |
| 粒子 particle | ✅ 128 粒子 + SNBT 参数 + 扩散/速度/数量 |
| 世界控制 | ✅ time/weather/difficulty |
| 标签/清除 | ✅ tag 添加/移除/查询；clear 全部/指定/数量 |
| 游戏规则 | ✅ gamerule 59 条，布尔/整数/查询 |
| 世界边界 | ✅ worldborder 尺寸/中心/伤害/警告 |
| 队伍 | ✅ team 创建/修改/加入/离开/删除/查询 |
| 出生点/加载 | ✅ spawnpoint/setworldspawn/forceload |
| 实体属性 | ✅ attribute 查询/设置/修饰符 |
| 进度/自动化 | ✅ advancement/function/schedule |
| 物品槽位 | ✅ item 替换/修饰符 |
| 高级数据包 | ✅ 谓词（含结构化）/进度（含结构化）/战利品表（含结构化） |
| NBT/战利品 | ✅ data（含 modify/from）/loot |
| 队伍文本 | ✅ team 前缀/后缀/高级显示名 |
| 单元体系 | ✅ 资源 ID/数值/物品栈/槽位 |
| 更新公告 | ✅ 当前版本 + GitHub 历史入口 |
| 命令方块链 | ✅ 2–64 个方块、方向偏移、整链输出 |
| 数据包导出 | ✅ 独立工作区、多函数、load/tick |
| 物品组件 | ✅ 13 类；复杂组件可用 raw |
| 选择器编辑 | ✅ 常用字段；`scores` 可保留但暂无 UI |
| 命令方块 setblock | ✅ 单块 + 命令方块链 |
| 项目保存 / 自动保存 | ✅ JSON 文件 |
| 安装包 / 便携版 | ✅ 未签名（见 08） |
| 自动更新 | ✅ 0.1.37 → 0.1.38 静默升级已实测；GitHub v0.1.38 Release 已发布 |
| 1.12.2 / 1.13–1.20.4 | ❌ 仅设计 |
| 单元体系 | ❌ P1 后续 |

## 8. 已知限制

- 暂无 Mojang 官方组件 schema：复杂组件通过原始 SNBT 兜底。
- 未接入游戏内验证：语义错误（例如选择器在特定维度无匹配）只能进游戏确认。
- 1.21.1 为组件版：命令树与通用构建器来自 1.21.1，可视化表单仍按 26.3 语法生成。
- 1.20.4 为 NBT 版：give 使用 NBT 表单，31 个兼容表单自动启用；loot/gamerule/particle/attribute 等继续命令树。
- 1.13–1.20.4 尚未接入。
- 便携版不支持自动更新（electron-updater 限制），只提示手动下载。
