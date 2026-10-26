# Changelog

所有版本变更记录在此。版本号遵循 SemVer。

## [0.1.1] - 2026-10-26

P1 第一批：更多专用表单与文本导入。

### 新增

- `summon` 专用表单：实体搜索/快速选择、坐标开关、实体 NBT。
- `setblock` 专用表单：方块搜索、方块状态属性下拉、方块实体 NBT、放置模式（replace/destroy/keep/strict）。
- `give` 文本导入：粘贴 `/give` 命令，还原选择器、物品、组件与数量；未知组件保留为 raw。
- 新增物品组件：`item_name`、`rarity`、`max_damage`、`damage`、`enchantment_glint_override`、`custom_data`，以及任意 `raw` 组件。
- 项目文件保存新增 summon/setblock 状态，旧项目自动补默认值。

### 改进

- 解析器补充 `minecraft:entity` / `item_stack` 的常见变体与错误提示。
- 冒烟测试覆盖 give 导入、summon、setblock 与方块状态。
- 测试数量 50 → 65。

## [0.1.0] - 2026-10-26

首个可运行骨架。

### 新增

- 26.3 数据包：命令树、注册表、方块状态、物品组件默认值，manifest 与 SHA-256 校验。
- `give` 专用表单：目标选择器、物品搜索、数量、自定义名称/描述/附魔/无法破坏/最大堆叠/自定义模型数据。
- 通用命令构建器：94 个根命令按官方命令树逐层生成。
- 命令方块模式：`/setblock` 生成，NBT 转义、朝向、条件、自动、已激活、记录输出。
- 项目保存/打开、最近项目、4 秒自动保存、崩溃恢复。
- 深色/浅色主题、设置、诊断导出、本地日志。
- NSIS 安装包 + 便携版 + `latest.yml` + blockmap。
- electron-updater 自动更新：检查、下载、重启安装、跳过版本、稳定/测试渠道、手动下载兜底。
- GitHub Actions：CI 与 Release 流水线。
- 50 个核心逻辑测试 + Playwright Electron 冒烟测试。

### 已知限制

- 仅 26.3 现代语法；1.20.5 以下与 1.12.2 未实现。
- 复杂组件使用原始 SNBT。
- 未配置代码签名。
- 数据包在线更新尚未接入（随安装包分发）。
