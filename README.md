# MC 指令工坊

[![CI](https://github.com/JiangNanChina/mc-command-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/JiangNanChina/mc-command-studio/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/JiangNanChina/mc-command-studio)](https://github.com/JiangNanChina/mc-command-studio/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Windows 桌面版 Minecraft Java 命令编辑器。用表单拼命令，实时复制，或生成放置命令方块的 `/setblock`。
>
> **不是网页**：安装包双击即用，不需要浏览器、服务器或账号，断网可编辑。
>
> **[下载最新版](https://github.com/JiangNanChina/mc-command-studio/releases/latest)**

![give 表单](docs/assets/give-form.png)

## 功能（0.1.1）

- **26.3 数据包**：94 个根命令、1,197 个字面量、59 种参数类型、1,658 个物品、1,286 个方块。
- **专用表单**：`give`、`summon`、`setblock` 已从通用构建器升级为专用界面。
- **give**：目标选择器、物品搜索、数量、13 类物品组件（名称、描述、附魔、耐久、稀有度、自定义数据等）。
- **give 文本导入**：粘贴 `/give` 命令，还原成可编辑表单；未知组件保留为 raw。
- **setblock**：方块搜索、方块状态属性、方块实体 NBT、4 种放置模式。
- **通用构建器**：其余根命令按官方命令树逐层拼接；未覆盖参数用原始文本 + 基础校验兜底。
- **命令方块**：一键生成 `/setblock … command_block[facing=up]{Command:"…"}`，处理引号/反斜杠转义。
- **本地项目**：`.mcstudio` JSON、最近打开、4 秒防抖自动保存、异常退出恢复。
- **桌面体验**：深色/浅色主题、中文界面、原生菜单、文件关联、单实例、高 DPI。
- **分发与更新**：NSIS 安装包 + 便携版 + `latest.yml`；electron-updater 自动检查/下载/重启安装；GitHub Actions 发布流水线。已在本机验证 0.1.0 → 0.1.1 自动升级；便携版会禁用自动更新并提示手动下载。

## 下载与安装

发布页：https://github.com/JiangNanChina/mc-command-studio/releases

- 安装版：`MC-Command-Studio-Setup-<版本>.exe`，单用户安装，无需管理员。
- 便携版：`MC-Command-Studio-<版本>-portable.exe`，双击即用；**便携版不会自动更新**，请手动下载新版。
- 校验和：发布页附 `checksums.txt`（本地构建产物在 `release/checksums.txt`）。

> 当前构建未做代码签名，Windows SmartScreen 可能提示“未知发布者”。选择“更多信息 → 仍要运行”，或自行校验 SHA-256。正式发布前应配置证书，见 [docs/08-release-update.md](docs/08-release-update.md)。

系统要求：Windows 10 22H2+ / Windows 11 x64。

## 从源码构建

需要 Node.js 24+、pnpm 11+。

```bash
pnpm install
pnpm setup:electron     # Electron 45 不再自动下载运行时
pnpm data:build         # 生成 packs/26.3（约 2.2 MB）
pnpm dev                # 开发模式
pnpm typecheck
pnpm test
pnpm build:win          # 安装包 + 便携版 + latest.yml
```

产物在 `release/`：

- `MC-Command-Studio-Setup-0.1.1.exe`
- `MC-Command-Studio-0.1.1-portable.exe`
- `latest.yml`、`.blockmap`

如果 `pnpm install` 后没有 Electron 二进制，运行 `pnpm setup:electron`；国内网络可设置：

```powershell
$env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"
$env:ELECTRON_BUILDER_BINARIES_MIRROR = "https://npmmirror.com/mirrors/electron-builder-binaries/"
```

## 数据来源

命令树、注册表、方块状态、物品组件默认值来自 Minecraft 官方数据生成器（`server.jar --reports`），通过 [misode/mcmeta](https://github.com/misode/mcmeta) 的 summary tag 获取并校验。数据包不包含游戏 jar、材质或语言文件。

重新生成 / 校验：

```bash
pnpm data:build --force
pnpm data:verify
```

## 测试

```bash
pnpm test        # 65 个核心逻辑用例
pnpm e2e         # Playwright 启动 Electron，覆盖 give/导入/summon/setblock/命令方块
```

`pnpm e2e` 需要先 `pnpm build`，并且需要可用的 Windows 桌面会话。截图输出到 `artifacts/`。

## 发布与自动更新

- 仓库已配置为 `JiangNanChina/mc-command-studio`。如果你 fork 到其他账号，运行下面的命令重新配置：

```bash
pnpm configure:github <你的GitHub用户名> mc-command-studio
```
- 更新版本并打 tag：

```bash
pnpm release:patch
git add . && git commit -m "release: v0.1.1"
git tag v0.1.1
git push origin main --tags
```

- GitHub Actions `Release` 会构建并创建 draft Release，上传安装包、便携版、`latest.yml`、blockmap、checksums。
- 人工检查 draft 后发布，客户端即可自动更新。
- 便携版通过 `PORTABLE_EXECUTABLE_DIR` 识别，不会请求更新源，只提示手动下载。
- 国内可配置 `generic` 镜像（`MCSTUDIO_UPDATE_URL`），详见 [docs/08-release-update.md](docs/08-release-update.md)。

## 目录

```
apps/desktop/        Electron 主进程 / preload / React 界面
packages/core/       命令序列化、校验、数据包 schema（纯 TS）
packages/content/    命令中文名、分类、示例、组件元数据
tools/pipeline/      数据包构建/校验
tools/release/       版本、Electron 安装、本地更新源
docs/                产品、架构、数据、命令模型、UI、版本、路线、发布
packs/               生成的数据包（不入库）
release/             打包产物（不入库）
```

## 已知限制

- 当前只实现 26.3 的现代语法；1.13–1.20.4 与 1.12.2 在路线图中。
- 复杂物品组件暂以原始 SNBT 输入，后续补专用表单。
- 不连接游戏做语义验证；语法/格式能校验，实际效果需进游戏确认。
- 便携版不支持自动更新。

## 许可与声明

- 代码：MIT（见 [LICENSE](LICENSE)）。
- 命令中文说明、界面文案：原创。
- 非官方产品：与 Mojang Studios、Microsoft 没有关联，也未获得其批准或认可。Minecraft 是 Mojang Studios 的商标。
- 第三方依赖许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## 文档

- [产品定义](docs/01-product.md)
- [架构](docs/02-architecture.md)
- [版本数据包](docs/03-version-data.md)
- [命令模型](docs/04-command-model.md)
- [界面与交互](docs/05-ui-ux.md)
- [全版本路线](docs/06-version-matrix.md)
- [路线图与风险](docs/07-roadmap-risks.md)
- [发布与自动更新](docs/08-release-update.md)
