# 17 · 本地测试版与正式版更新

## 1. 测试版定位

测试版仅用于本地开发验证：

- 独立 `appId`：`com.mcstudio.app.test`
- 独立产品名：`MC 指令工坊 测试版`
- 独立安装目录
- 独立更新源：`http://127.0.0.1:8123/updates/`
- 不发布到 GitHub Releases
- 不替代正式版

## 2. 当前测试版

```text
release-test/MC-Command-Studio-Test-Setup-0.5.1-test.3.exe
```

已安装到本地测试目录并验证版本：

```text
0.5.1-test.3
```

## 3. 后续改动怎么看到

### 方式 A：开发热更新（最快）

```bash
pnpm dev
```

适合开发过程中立即看界面变化。

### 方式 B：构建新的测试版

每次改完代码，提升测试版本号：

```bash
pnpm test:build 0.5.1-test.4
pnpm test:serve
```

测试版会自动检查：

```text
http://127.0.0.1:8123/updates/test.yml
```

检测到新版本后：

1. 点击“下载更新”
2. 下载完成
3. 点击“重新载入”
4. 自动安装并重新打开

已实测：

```text
0.5.1-test.1 -> 0.5.1-test.2 -> 0.5.1-test.3
```

## 4. 正式版更新行为

正式版使用 GitHub Releases 的 `latest.yml`。

用户点击更新后：

1. 下载安装包
2. 下载完成
3. 点击“重新载入”
4. 自动执行静默安装
5. 应用自动重新打开，升级完成

Windows 不允许替换正在运行的 exe，因此“重新载入”会短暂退出并自动重启；用户无需手动关闭软件。

## 5. 测试版更新源

```bash
pnpm test:serve
```

服务目录：`release-test/`

```text
/updates/test.yml
/updates/MC-Command-Studio-Test-Setup-<version>.exe
/updates/*.blockmap
```

## 6. 注意

- 测试版与正式版数据目录独立。
- 测试版升级不会影响正式版安装。
- 测试版不签名，Windows 可能提示未知发布者。
- 正式发版仍需用户明确确认。
