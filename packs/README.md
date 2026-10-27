# packs

版本数据包由 `tools/pipeline/build-pack.mjs` 生成，不提交到 Git。

```bash
pnpm data:build
pnpm data:verify
```

当前构建十个版本：

- `26.3`：主版本，所有可视化表单按此语法生成。
- `1.21.1`：组件引擎，命令树完整；主要表单已按 1.21.1 差异适配。
- `1.20.4`：NBT 引擎，命令树 + 37+ 兼容表单、旧版 particle/attribute。
- `1.20.3`：NBT 引擎，命令树 + 兼容表单。
- `1.19.4`：NBT 引擎，命令树 + 兼容表单（无 tick/random/rotate 等新命令）。
- `1.18.2`：NBT 引擎，旧版目录与命令树。
- `1.16.5`：NBT 引擎，旧版目录与命令树。
- `1.15.2`：NBT 引擎，旧版目录与命令树。
- `1.14.4`：NBT 引擎，旧版目录与命令树。
- `1.13.2`：官方 server reports + client lang 转换；NBT 引擎、旧版目录。

> 1.13.2 由 `tools/pipeline/build-1.13.2.mjs` 生成，产物已提交；CI 不重复下载 server/client jar。

生成内容：

- `commands.json`：官方命令树
- `registries.json`：物品/方块/实体/附魔等注册表
- `blocks.json`：方块状态
- `item-components.json`：物品默认组件
- `manifest.json`：版本、来源哈希、统计
- `index.json`：数据包索引

打包时 electron-builder 会把整个 `packs/` 复制到安装目录的 `resources/packs`。开发时也可以用环境变量 `MCSTUDIO_PACKS_DIR` 指向别的目录。

数据不包含游戏 jar、材质或语言文件。
