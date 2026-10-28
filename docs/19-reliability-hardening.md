# P1/P2 可靠性与验证改造

## 文档与保存

- 快捷表单字段存入 `ProjectPayload.quickDrafts`，兼容没有此字段的旧项目；切换命令后保留草稿，保存、恢复、撤销使用同一份数据。
- `store/project.ts` 管理项目与持久化，`store/session.ts` 管理主题、更新、搜索等会话操作。`store/document.ts` 从归一化模型提取字段，避免历史与保存分别维护字段清单。
- Immer patches 只记录文档变更；500 ms 内同字段输入合并，新的编辑始终清空 redo。保留最多 100 步，界面事件不序列化整个文档。
- `documentRevision` 驱动 4 秒防抖自动保存。持久化按顺序执行，自动保存执行时读取当前文档，避免旧任务覆盖新恢复快照。
- 保存保留原 `createdAt`，只有相同项目 session 和 revision 的完成结果才清除 dirty；排队普通保存跟随前一次另存为的新路径。
- 恢复失败或被新项目/版本选择取代时不修改文档；恢复成功保留源恢复文件，直到保存或明确放弃。

## 桌面存储与退出

- 设置读改写及同路径写入串行化；唯一临时文件完整写入后原子替换，失败保留旧文件并清理临时文件。
- 恢复内容和时间戳保存在一个原子记录中，读取兼容旧版分离格式。无效设置字段恢复默认值，无效最近项目被过滤。
- 关闭、重启、安装更新都先向 renderer 请求处理未保存内容；用户可保存、放弃或取消，保存失败保持窗口。主进程等待写队列完成。
- IPC 除参数校验外还校验当前窗口主 frame 与精确可信来源，生产环境继续启用上下文隔离和沙箱。

## 指令与界面

- 预览、字符数、复制按钮、Ctrl+Enter 和命令方块包装共用对象形式的输出函数；仅当前命令草稿变化时重新计算。
- 组件按所需字段订阅状态，下载进度、Toast 等不会让全部表单重新渲染。
- `VersionCapabilities` 区分 1.20.5 组件引擎、1.21.4 模型数据变化、1.21.5 文本与附魔组件变化；旧版组件导入保留样式，复杂内容保持 raw。
- `give` 和 `execute` 保留字符串内部空白；1.13–1.20.4 的 NBT give 使用 `item{nbt} count`。

## 数据与发布

- 版本库包含数据快照。构建按 catalog 遍历，缓存命中也验证；不再在 package.json 维护两套长版本列表。
- 构建、主进程和验证复用同一 schema。生成文件 `fileHashes` 与来源 `sources[].sha256` 分开；校验 JSON 结构、真实计数、字节哈希和别名目标。
- 旧组件数组在显式迁移中规范化；已有哈希不符不能通过迁移重签。catalog 时间戳确定化，相同输入不会反复改动文件。
- CI 与 Release 均运行数据校验和持久化回归；打包冒烟直接读取 `resources/packs`，不使用仓库资源覆盖错误。
- 主进程将 workspace 源码及纯 JavaScript 运行依赖打入 bundle，避免安装包依赖 pnpm 布局的传递依赖收集。`pnpm check:runtime` 验证 main/preload 仅外置 Electron 与 Node 内置模块。

## 验证入口

```bash
pnpm typecheck
pnpm test
pnpm data:verify
pnpm build
pnpm check:runtime
pnpm e2e
pnpm test:e2e:persistence
```

`data:verify` 包含真实临时目录的管线故障测试；Vitest 覆盖存储失败、并发设置、保存/恢复竞态、版本乱序加载、快捷草稿和序列化。桌面 E2E 需要可用的 Windows 桌面会话。

测试脚本默认保留 Chromium 沙箱。受限的本地 Windows 会话若在主进程启动前退出，可仅在该次测试设置 `MCSTUDIO_E2E_NO_SANDBOX=1`；此选项只影响 Playwright 启动参数，不更改生产窗口配置，CI 和 Release 不设置此变量。

`pnpm test:e2e:updater-bundle` 仅接受 `artifacts` 下的隔离目录包，使用本地随机端口更新源验证检查、下载和校验和，不执行安装。临时更新配置与独立缓存会在结束后恢复或清理；可用 `MCSTUDIO_E2E_EXE` 指定隔离程序。目录包本身未生成正式安装包的更新元数据，不能用于正式分发。

本地历史数据缺少首次输出哈希时，可显式运行 `pnpm data:migrate`。迁移只为已确认可信的数据建立基线；验证和缓存构建不会自动重签。
