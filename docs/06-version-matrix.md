# 06 · 全版本路线

## 1. 三套语法引擎

“全版本”不等于三份 UI。把差异收敛到三个引擎 + N 个数据包：

| 引擎 | 适用版本 | 命令语法 | 物品语法 | 关键差异 |
|---|---|---|---|---|
| **Modern Components** | 1.20.5 – 26.x | Brigadier + 新权限节点 | 数据组件 `[custom_name=…]` | 26.x 命令集/权限/组件持续变化 |
| **Brigadier NBT** | 1.13 – 1.20.4 | Brigadier | 物品 NBT `{display:{Name:…}}` | 旧 `execute` 分支、`data` 差异 |
| **Legacy** | ≤ 1.12.2 | 非 Brigadier（`testfor`、旧 `execute`） | 物品 NBT | 命令方块 NBT、OOC 方案 |

数据包可以每版本一个；主程序只加载对应引擎与数据。

## 2. 版本矩阵

| 版本段 | 状态 | 数据来源 | 预计工作量 | 阶段 |
|---|---|---|---|---|
| **26.3 / 26.4 快照** | ✅ 当前主版本 | mcmeta summary + 官方 reports | 已完成骨架 | P0 |
| 26.x 全量编辑器 | ⏳ | 同上 | 3–4 周 | P2 |
| **1.20.5 – 1.21.x** | 🚧 1.21.1 试验 | mcmeta / 官方 reports | 2–3 周 | P3 |
| **1.13 – 1.20.4** | 🚧 1.20.4 树模式 | mcmeta | 6–8 周 | P4 |
| 1.12.2 及更早 | ⏳ | 手工 schema + 社区数据 | 5–7 周 | P5 |

> 结论：全版本支持的总成本约 4–6 个月（1 人、20h/周），其中 1.13–1.20.4 的 NBT 编辑器与 1.12.2 的独立引擎占大头。建议先发现代版，再按版本段扩展。

## 3. 1.13 – 1.20.4

### 数据

- 官方 `--reports` 从 1.13 起可用；mcmeta 历史 tag 覆盖不稳定（实测 1.13.2/1.12.2 取不到 commands）。
- 需要为每个目标版本保存 server.jar，在 CI 里跑 `--reports`，再经过同一个 pipeline 归一化。
- 方块状态/注册表结构基本一致，pipeline 可以复用。

### 代码

- 新增 NBT 物品编辑器：
  - `display.Name` / `display.Lore`（JSON 字符串）
  - `Enchantments`（`{id, lvl}` 列表）
  - `AttributeModifiers`
  - `Unbreakable`、`CustomModelData`
  - `BlockEntityTag`、`EntityTag`
- 旧版 `execute` 有 `as/at/positioned/if/unless/store` 的早期形态；需要按版本数据包描述分支，不能沿用 26.x 的固定假设。
- `/give` 的 NBT 是可选第 4 参数（`give <target> <item> [count] [nbt]`），序列化路径要切换。

## 4. 1.12.2

### 为什么单独做

- 没有 Brigadier 命令树；`/execute` 是 `execute <实体> <x> <y> <z> <命令>`。
- 物品/实体全部使用 NBT；没有数据包函数（有 1.12 的 `functions` 目录但生态不同）。
- 命令方块 NBT：`Command`、`auto`、`conditionMet`、`powered`、`LastOutput`、`TrackOutput`、`SuccessCount`。
- OOC（一键命令）依赖掉落沙/命令方块矿车 + `TileEntityData` / `Command`，这是 CBC 时代的核心玩法。

### 计划

- 手工命令 schema（约 40 个根命令），独立 `LegacyEngine`，不污染现代序列化器。
- 复用同一套 UI 外壳与项目文件；通过 `pack.engine = 'legacy'` 切换。
- OOC 生成器单独一个面板：选择“掉落方块 / 命令方块矿车”，输入多行命令，生成一条 summon/setblock 命令。
- 明确警告：1.12.2 的 OOC 有实体数量与区块加载限制。

## 5. 版本迁移与提示

- 顶栏可切换 26.3 / 1.21.1 / 1.20.4 数据包；选择记忆在设置中。
- 1.21.1 的命令树与通用构建器来自 1.21.1；可视化表单仍按 26.3 语法生成，切换后会显示提示。
- 1.20.4 为 NBT 引擎，自动进入命令树模式；give 使用 NBT 表单，其他命令使用树；数据包目录使用旧版复数结构。
- 项目文件记录 `packId` 与 `schemaVersion`。
- 切换到不同版本时：
  - 校验命令路径是否存在；不存在的参数标红并保留原文。
  - 已知重命名给出迁移建议（`replaceitem` → `item`、`testfor` → `execute if entity`、NBT → 组件）。
  - 不自动改写语义不确定的命令，避免“看起来成功但进游戏报错”。

## 6. 发布顺序

1. **26.x 预览**：首版骨架，收集“最缺哪个编辑器”的反馈。
2. **26.x 完整**：20+ 编辑器、单元、数据包导出。
3. **1.20.5–1.21.x**：同一引擎，主要是数据包与少量语法差异。
4. **1.13–1.20.4**：NBT 编辑器，独立语法适配。
5. **1.12.2**：Legacy 引擎 + OOC。

每个版本段独立发布数据包；主程序通过“检查数据更新”拿到新包，不必为每个游戏版本发一次 exe。
