# 07 · 路线图与风险

## 1. 里程碑

| 阶段 | 目标 | 交付 | 估时（1 人 / 20h 周） |
|---|---|---|---|
| **M0 本轮** | 可运行骨架 + 文档 + 更新闭环 | 26.3 数据包、`give` 端到端、通用构建器、命令方块、项目、安装包、自动更新代码、224 测试、品牌图标 | 10–14 天 |
| M1 现代版 MVP | 常用命令覆盖 | 20+ 专用编辑器、选择器/物品/NBT/文本组件、单元体系、数据包导出、文本导入（高频命令）**（v0.1.1 summon/setblock/导入/13 组件；v0.1.2 更新公告；v0.1.3 execute/数据包；v0.1.4 tp/effect/fill；v0.1.5 clone/撤销重做；v0.1.6 命令方块链；v0.1.7 enchant/xp；v0.1.8 中文名/图标；v0.1.9 tellraw/title；v0.1.10 playsound/stopsound；v0.1.11 bossbar；v0.1.12 独立数据包工作区；v0.1.13 scoreboard；v0.1.14 particle；v0.1.15 世界控制；v0.1.16 tag/clear；v0.1.17 gamerule；v0.1.18 worldborder；v0.1.19 team；v0.1.20 出生点/加载；v0.1.21 品牌图标/公告；v0.1.22 attribute；v0.1.23 advancement/function/schedule；v0.1.24 item/高级数据文件/单元体系；v0.1.25 data/loot；v0.1.26 data modify/team 前缀；v0.1.27 data from/team 高级显示名；v0.1.28 战利品表结构化；v0.1.29 进度结构化；v0.1.30 谓词结构化；v0.1.31 bossbar get/list/scoreboard modify；v0.1.32 1.21.1 试验数据包/版本切换）** | 4–5 周 |
| M2 26.x 完整 | 命令方块工作区 | 链式布局、朝向计算、数据包/函数导出、命令历史、撤销重做 | 3–4 周 |
| M3 1.20.5–1.21.x | 同引擎多版本 | 🚧 1.21.1 数据包/切换已接入；差异适配与迁移提示待做 | 2–3 周 |
| M4 1.13–1.20.4 | NBT 引擎 | 🚧 1.20.4 NBT give + 31 个兼容表单；其余 NBT 编辑器待做 | 6–8 周 |
| M4 1.13–1.20.4 | NBT 引擎 | 物品/实体 NBT 编辑器、旧 execute、版本数据管线 | 6–8 周 |
| M5 1.12.2 | Legacy 引擎 | 手工命令 schema、旧 NBT、OOC、独立测试 | 5–7 周 |
| M6 生态 | 扩展 | 插件/模组模板、RCON 验证、分享、CLI | 持续 |

## 2. 当前完成度

| 项 | 状态 |
|---|---|
| 数据包 26.3 | ✅ 2.2 MB，校验通过 |
| 数据包 1.21.1 | 🚧 试验：83 根命令，构建/切换/打包已接入 |
| 数据包 1.20.4 | ✅ 树模式 + NBT give/item + loot + 32 个兼容表单 + 召唤预设 |
| 单元测试 | ✅ 224 个 |
| Electron 冒烟 | ✅ 公告→give→…→bossbar get/list→scoreboard modify→…→版本切换→execute；Release 工作流已设为门禁 |
| 安装包 | ✅ NSIS 约 123.5 MiB |
| 便携版 | ✅ 约 111.7 MiB |
| 更新公告 | ✅ 只显示当前版本 + GitHub 历史入口 |
| 品牌 | ✅ 应用图标/安装包图标/界面 Logo |
| 自动更新代码 | ✅ 0.1.40 → 0.1.41 静默升级已实测；GitHub v0.1.41 Release 已发布；便携版禁用自动更新已实测 |
| 可视化资源 | ✅ 中文名 + 图标：物品/方块/效果/附魔/实体/声音 |
| 富文本 | ✅ tellraw/title 颜色/样式/点击/悬停/时序 |
| 声音 | ✅ playsound/stopsound 1,991 声音 |
| BOSS 栏 | ✅ bossbar 创建/更新/移除/查询/列表 + 预览 |
| 计分板 | ✅ scoreboard 目标/显示位置/修改/分数/运算 |
| 多版本 | 🚧 26.3 + 1.21.1 组件 + 1.20.4 树模式 |
| 模板库 | ✅ 7 个常用模板 |
| 粒子 | ✅ particle 128 粒子 + SNBT 参数 |
| 世界控制 | ✅ time/weather/difficulty |
| 标签/清除 | ✅ tag/clear |
| 游戏规则 | ✅ gamerule 59 条 |
| 世界边界 | ✅ worldborder 8 种操作 |
| 队伍 | ✅ team 创建/修改/加入/离开/删除/查询 |
| 出生点/加载 | ✅ spawnpoint/setworldspawn/forceload |
| 实体属性 | ✅ attribute 查询/设置/修饰符 |
| 进度/自动化 | ✅ advancement/function/schedule |
| 物品槽位 | ✅ item 替换/修饰符 |
| 高级数据包 | ✅ 谓词（结构化）/进度（结构化）/战利品表（结构化） |
| NBT/战利品 | ✅ data（含 modify/from）/loot |
| 队伍文本 | ✅ team 前缀/后缀/高级显示名 |
| 单元体系 | ✅ units.ts |
| 可视化资源 | ✅ 中文名 + 图标：物品/方块/效果/附魔/实体 |
| 更新公告 | ✅ 更新后首次启动横幅 + 铃铛 + 版本历史 |
| execute 执行链 | ✅ as/at/positioned/if/store/run |
| 数据包导出 | ✅ 独立工作区、多函数、load/tick |
| 高频表单 | ✅ tp / effect / fill / clone / enchant / xp |
| 撤销 / 重做 | ✅ 全局 100 步 + 快捷键 |
| 命令方块链 | ✅ 2–64 个方块、方向偏移、整链输出 |
| 代码签名 | ❌ 未配置证书（见 08） |

## 3. 风险与对策

| 风险 | 影响 | 概率 | 对策 |
|---|---|---|---|
| “全版本”范围过大 | 长期无法发布 | 高 | 三引擎分层；每阶段独立可发布；先现代版 |
| 命令/组件随快照漂移 | 表单失效 | 高 | 数据驱动 + 周更 CI + 版本差异 warning + raw 兜底 |
| 1.12.2/1.13 数据缺失 | legacy 成本上升 | 高 | 自建 server.jar `--reports` 管线；1.12.2 手工 schema 只覆盖常用子集 |
| 组件 schema 不公开 | 复杂组件只能手写 | 高 | 默认值统计 + 18 个手工 schema + 原始 SNBT |
| 文本→表单解析复杂 | 导入体验差 | 中 | 先覆盖 `give`/选择器；其余保留 raw |
| 无签名证书 | SmartScreen 警告、更新校验弱 | 高 | 公开发布前准备 OV/EV 或 Azure Trusted Signing；未签名仅内部测试 |
| GitHub 国内不可达 | 自动更新失败 | 中 | `generic` 镜像 + 手动下载；失败不阻塞 |
| 更新破坏用户环境 | 信任受损 | 中 | 小范围灰度、保留旧安装包、项目 schema 迁移、备份 |
| 数据包/AI 内容版权 | 下架风险 | 中 | 不分发 Mojang 资产；原创中文说明；来源标注 |
| Electron 体积/杀软误报 | 下载转化低 | 中 | 便携版、校验和、签名、发布页说明 |
| 单人维护 | 版本滞后 | 高 | 数据/文案分离；CI 周更；模板与社区贡献 |

## 4. 质量门

每个发布候选必须通过：

1. `pnpm typecheck`
2. `pnpm test`（核心逻辑；新增功能必须有用例）
3. `pnpm data:verify`
4. `pnpm build`
5. `pnpm e2e`（Electron 冒烟；本地/有桌面会话的 Windows）
6. 安装包在干净 Windows 10/11 上安装、启动、卸载
7. 自动更新：上一版 → 新版本，项目与设置保留
8. 不包含 Mojang 资产；关于页声明存在
9. 版本号、tag、CHANGELOG 一致（`pnpm check:version`）

## 5. 发布检查清单

- [ ] `pnpm release:patch` 更新版本与 CHANGELOG
- [ ] `pnpm build:win` 生成安装包/便携版/latest.yml/blockmap
- [ ] `pnpm data:verify`
- [ ] 在干净虚拟机安装并跑一遍 give → 复制 → setblock
- [ ] 用本地更新源验证旧版 → 新版升级
- [ ] 检查 `latest.yml` 与安装包同名、sha512 正确
- [ ] 上传 GitHub Release（draft），检查 checksums
- [ ] 发布后 24 小时观察更新错误日志（用户导出）
- [ ] 保留最近 3 个版本安装包

## 6. 后续优先级建议

1. `give` / `summon` / `setblock` / `execute` 四条命令已做到“不用查文档”；下一步补 `tp`、`effect`、`fill` 等高频专用表单。
2. execute 与数据包导出已完成；下一步是命令方块链式工作区（链式布局、朝向计算、导出为函数）。
3. 单元体系（物品/方块/选择器/文本组件复用）与撤销重做。
4. 1.12.2 放在最后；如果用户呼声低，可以只保留“命令转换器”而不做完整 legacy 表单。
