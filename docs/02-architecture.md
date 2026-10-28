# 02 · 架构

## 1. 进程模型

```
┌──────────────────────── Renderer（React 19）────────────────────────┐
│ 命令库 / 表单 / 通用构建器 / 输出 / 设置 / 更新横幅                    │
│ Zustand + Immer 状态；所有命令文本由 @mcstudio/core 纯函数生成         │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ window.mcstudio（preload 暴露的窄接口）
                               │ ipcRenderer.invoke / on
┌──────────────────────────────▼───────────────────────────────────────┐
│ Main（Node / Electron）                                               │
│ app 生命周期 · app:// 协议 · 窗口 · 菜单 · 单实例 · 文件关联           │
│ packs（读数据包）· storage（设置/项目/自动保存）· updater（更新）      │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ fs
┌──────────────────────────────▼───────────────────────────────────────┐
│ resources/packs/26.3：commands.json · registries.json · blocks.json    │
│                      item-components.json · manifest.json             │
└──────────────────────────────────────────────────────────────────────┘
```

Electron 只作为承载壳：生产环境用自定义 `app://bundle/` 协议加载本地静态文件，**不启动 HTTP 服务**。开发环境由 electron-vite 提供 Vite dev server。

## 2. 目录

```
apps/desktop/
  src/main/index.ts        app 启动、协议、窗口、单实例、文件关联
  src/main/ipc.ts          IPC 注册与 zod 校验
  src/main/packs.ts        数据包发现与加载
  src/main/storage.ts      设置、项目文件、自动保存、日志路径
  src/main/updater.ts      electron-updater 封装与状态机
  src/main/menu.ts         原生菜单
  src/preload/index.ts     contextBridge API
  src/shared/types.ts      main / preload / renderer 共享类型
  src/renderer/src/        React 应用、Zustand store、组件
packages/core/src/         命令模型、转义、选择器、物品、命令方块、数据包 schema
packages/content/src/      命令中文名/分类/示例、组件元数据
tools/pipeline/            数据包构建与校验
tools/release/             版本校验、bump、Electron 安装、本地更新源
tools/e2e/                 Playwright Electron 冒烟测试
packs/                     版本库维护的数据快照（构建时复制进安装包）
docs/                      本文档
```

## 3. 核心模块

### 3.1 `@mcstudio/core`（纯 TS，无 Electron/DOM 依赖）

| 文件 | 职责 |
|---|---|
| `escape.ts` | SNBT 字符串、命令方块字符串、资源 ID、短 ID、控制字符检测 |
| `selector.ts` | 选择器模型、序列化、范围/坐标/NBT 校验、@e 警告 |
| `item.ts` | 物品组件模型、组件序列化、`/give` 构建 |
| `commandBlock.ts` | 命令方块 NBT、`/setblock` 构建、坐标/朝向校验 |
| `commandTree.ts` | 命令树遍历、参数类型说明、通用路径序列化、基础参数校验 |
| `pack.ts` | 数据包 manifest / registries / blocks / components 的 zod schema |
| `project.ts` | `.mcstudio` 项目文件 schema |
| `version.ts` | SemVer 比较（测试与 UI 使用） |
| `diagnostics.ts` | 统一诊断结构（error / warn / info） |

所有核心函数返回 `{ text, diagnostics }`，UI 只负责展示与交互，不在组件里拼字符串。

### 3.2 Renderer

- `store.ts`：Zustand + Immer。持有数据包、give 表单、通用路径、命令方块参数、项目元数据、设置、更新状态、弹窗、Toast。
- `lib/commandOutput.ts`：把当前状态交给 core，得到命令文本与诊断。
- `lib/api.ts`：读取 `window.mcstudio`，缺失时给出明确错误。
- 组件：`Header`、`Sidebar`、`Welcome`、`GiveForm`、`ComponentsEditor`、`SelectorDialog`、`ItemPickerDialog`、`GenericBuilder`、`OutputPanel`、`SettingsDialog`、`AboutDialog`、`UpdateBanner`、`AutosaveBanner`、`StatusBar`、`Toast`。
- 输出使用 CodeMirror 6 只读编辑器，实时替换文档，不做光标管理。

### 3.3 Main

- `packs.ts`：优先 `MCSTUDIO_PACKS_DIR`，其次打包后的 `resources/packs`，开发时 `../../packs`。读 manifest 与四个数据文件，返回给 renderer。
- `storage.ts`：设置 JSON、项目文件（≤ 24 MB）、自动保存、原子写入、最近项目（最多 10 条）。
- `updater.ts`：启动 10 秒后检查、每 6 小时检查；`autoDownload=false`；提供 available/downloading/downloaded/error 状态；跳过版本持久化；支持 `MCSTUDIO_UPDATE_URL` 覆盖为 generic 静态源。
- `ipc.ts`：zod 校验所有入参；路径限制 4 KB、项目 24 MB、复制 100 KB；外链只允许 http/https。
- `menu.ts`：文件/编辑/视图/帮助；菜单动作通过 `menu:action` 发给 renderer。
- 单实例 + 文件关联：第二个实例会把 `.mcstudio` 路径转给现有窗口。

## 4. IPC 契约

| 通道 | 入参 | 返回 |
|---|---|---|
| `app:info` | – | 版本、Electron/Chromium、路径、更新源 |
| `app:open-external` | https URL | void |
| `app:export-diagnostics` | – | 保存路径或 null |
| `app:show-item` | 路径 | void |
| `packs:list` | – | `PackSummary[]` |
| `packs:load` | pack id | `LoadPackResult` |
| `settings:get` / `settings:update` | patch | `UserSettings` |
| `project:open` / `project:open-path` | – / 路径 | `{path,name,content}` |
| `project:save` / `project:save-as` | `{content,path?,suggestedName?}` | `{path,name}` |
| `project:autosave` / `get-autosave` / `clear-autosave` | content / – | void / content |
| `clipboard:write` | 文本 | void |
| `updater:get-state` / `check` / `download` / `install` / `skip` | – / manual / version | `UpdateState` |
| 事件 `updater:event` | – | `UpdateState` |
| 事件 `menu:action` | – | `MenuAction, payload?` |

## 5. 安全基线

- `contextIsolation: true`、`sandbox: true`、`nodeIntegration: false`、`webSecurity: true`。
- preload 仅暴露显式方法，不暴露 `ipcRenderer` 本身。
- 生产环境禁止远程内容：CSP `default-src 'self'`；外链一律交给系统浏览器。
- `app://` 处理器做路径归一化与目录穿越检查；只读。
- 禁用所有权限请求（`setPermissionRequestHandler` 一律拒绝）。
- 更新走 HTTPS；签名校验由 electron-updater + `publisherName` 负责（正式发布需配置证书）。

## 6. 数据流

```
pipeline 构建 pack
  → main 读取 pack（启动一次）
  → renderer 选择命令
  → 修改 give / generic 状态
  → core 序列化 + 诊断
  → OutputPanel 显示 / 复制 / setblock
  → 项目 JSON / 自动保存（4 秒防抖）
```

## 7. 错误处理

- 数据包缺失/损坏：主界面显示错误面板，包含数据包路径、重试、打开目录、`pnpm data:build` 提示。
- 项目打开失败：Toast + 不改变当前状态；项目文件 schema 不兼容时明确提示。
- 自动保存失败：静默重试（下次编辑），不打断用户。
- 更新失败：状态栏与横幅提示，提供“手动下载”；应用功能不受影响。
- 主进程未捕获异常 / Promise rejection：写入 electron-log，不崩溃弹窗。

## 8. 性能

- 数据包约 2.2 MB（JSON 合计），一次性 IPC 传输；启动只解析 manifest、命令树与注册表。
- 物品选择器最多渲染 160 条结果，避免上千 DOM 节点。
- 输出编辑器只在文本变化时 dispatch 一次全文替换。
- 自动保存 4 秒防抖，避免频繁写盘。
- 实测冷启动到可交互约 2 秒（开发构建、Windows 本地）。

## 9. P1/P2 可靠性改造

项目与会话操作拆至 store/project.ts、store/session.ts；store/document.ts 提供统一持久化字段和历史过滤。文档变更通过 Immer patches 更新 revision、撤销与重做；界面状态不写入历史。自动保存依赖 revision，快捷草稿也属于项目文档。所有输出入口接收文档对象，使用当前目标版本能力生成语法。

项目与设置采用按路径串行的临时文件原子替换；恢复文件将内容与时间戳一次提交。保存结果仅清除相同 session/revision 的 dirty。主进程退出、重启和安装更新均与 renderer 握手，用户可保存、放弃或取消，保存失败保留窗口。IPC 校验受信主 frame 与来源。

数据包构建、验证、主进程加载共用 core schema，并验证实际统计与 fileHashes。变更范围、验证和历史迁移见 [19-reliability-hardening.md](19-reliability-hardening.md)。
