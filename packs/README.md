# packs

版本数据包由 `tools/pipeline/build-pack.mjs` 生成，不提交到 Git。

```bash
pnpm data:build
pnpm data:verify
```

当前构建两个版本：

- `26.3`：主版本，所有可视化表单按此语法生成。
- `1.21.1`：组件引擎，命令树完整；部分可视化表单可能与 1.21.1 存在语法差异。
- `1.20.4`：NBT 引擎，仅命令树/通用构建器模式，可视化表单暂不可用。

生成内容：

- `commands.json`：官方命令树
- `registries.json`：物品/方块/实体/附魔等注册表
- `blocks.json`：方块状态
- `item-components.json`：物品默认组件
- `manifest.json`：版本、来源哈希、统计
- `index.json`：数据包索引

打包时 electron-builder 会把整个 `packs/` 复制到安装目录的 `resources/packs`。开发时也可以用环境变量 `MCSTUDIO_PACKS_DIR` 指向别的目录。

数据不包含游戏 jar、材质或语言文件。
