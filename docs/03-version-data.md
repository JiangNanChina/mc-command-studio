# 03 · 版本数据包

## 1. 为什么数据驱动

Minecraft 的命令集与参数类型每个版本都在变：26.x 的命令树有 94 个根命令、1,197 个字面量节点、59 种参数解析器；`dialog`、`waypoint`、`stopwatch`、`compute`、`test` 等命令都是近版本新增。手写表单无法跟上，所以本项目把“版本”变成数据包：

- 命令树决定表单层级、必填/可选参数、可执行节点、权限提示。
- 注册表决定物品/方块/实体/附魔下拉选项。
- 物品组件默认值帮助推导组件类型与常见值。
- 主程序只解释数据，不硬编码“26.3 有 94 个命令”。

## 2. 数据来源

| 数据 | 来源 | 说明 |
|---|---|---|
| 命令树 | `server.jar --reports` → `reports/commands.json` | 官方生成，含 parser/properties/executable/permissions |
| 注册表 | `reports/registries.json` | 190 个注册表；本项目使用 item / block / entity_type / enchantment 等 |
| 方块状态 | `reports/blocks.json` | 属性表 + 默认状态 |
| 物品组件默认值 | 26.x `reports/minecraft/components/item` | 逐物品 JSON，聚合为 `item-components.json` |
| 版本元数据 | Mojang `version_manifest_v2.json` + mcmeta `versions` | data version、pack format、发布类型 |
| 加速源 | `https://cdn.jsdelivr.net/gh/misode/mcmeta@<version>-summary/` | 已把上述报告整理成稳定 JSON |

`tools/pipeline/build-pack.mjs` 默认从 jsDelivr 的 mcmeta tag 拉取，失败自动重试 3 次；也可改成从本地 `generated/reports` 读取。

> 实测：mcmeta 的 `1.12.2-summary`、`1.13.2-summary` 下取不到 commands 数据；1.16.5 / 1.20.4 / 1.21.5 / 26.x 可用。因此 1.13–1.20.4 应自行用官方 server.jar 生成，1.12.2 需要手工 schema（见 06）。

## 3. 26.3 数据包

生成命令：

```bash
pnpm data:build        # 已存在则跳过
pnpm data:verify       # 校验文件、哈希、统计
```

产物位于 `packs/26.3/`：

| 文件 | 大小 | 内容 |
|---|---:|---|
| `commands.json` | 185 KB | 94 根命令、1,197 字面量、59 参数类型 |
| `registries.json` | 885 KB | 1,658 物品、1,286 方块、161 实体、43 附魔等 |
| `blocks.json` | 153 KB | 方块属性与默认状态 |
| `item-components.json` | 954 KB | 1,658 个物品的默认组件 |
| `manifest.json` | 1.3 KB | 版本、哈希、统计 |
| `index.json`（packs 根） | < 1 KB | 可用数据包列表 |

合计约 **2.2 MB**；打包后随 `extraResources` 放入安装目录 `resources/packs`。

### manifest 示例

```json
{
  "schemaVersion": 1,
  "id": "26.3",
  "gameVersion": "26.3",
  "dataVersion": 5023,
  "packFormat": 121,
  "type": "release",
  "generatedAt": "2026-10-25T17:31:24.279Z",
  "sources": [
    { "name": "commands", "url": "https://…/commands/data.min.json", "sha256": "…" }
  ],
  "files": {
    "commands": "commands.json",
    "registries": "registries.json",
    "blocks": "blocks.json",
    "itemComponents": "item-components.json"
  },
  "counts": {
    "roots": 94,
    "literals": 1197,
    "parsers": 59,
    "items": 1658,
    "blocks": 1286,
    "enchantments": 43,
    "entities": 161
  }
}
```

`tools/pipeline/verify-pack.mjs` 会检查文件非空、来源哈希格式、根命令/物品/方块数量下限。

## 4. 物品组件 schema 策略

官方没有公开组件字段 schema，采用三层策略：

1. **默认值统计**：汇总 1,658 个物品的组件键与默认值，推导基础类型（数字/字符串/布尔/对象/数组）与常见枚举。
2. **手工 schema（当前 13 个）**：`custom_name`、`item_name`、`lore`、`enchantments`、`unbreakable`、`max_stack_size`、`max_damage`、`damage`、`rarity`、`enchantment_glint_override`、`custom_model_data`、`custom_data`、`raw`。
3. **原始 SNBT 兜底**：任何组件都可以直接写 SNBT；解析失败只提示，不丢弃文本。

后续优先补齐：`attribute_modifiers`、`container`、`potion_contents`、`food`、`tool`、`charged_projectiles`、`bundle_contents`、`written_book_content`。

## 5. 命令数据如何使用

- 侧边栏根命令来自 `commands.children`。
- 通用构建器逐层读取 `children`：literal 作为按钮，argument 显示类型说明与原始输入。
- 可执行节点由 `executable: true` 标记。
- 权限提示读取 26.x 的 `permissions.permission.level`，显示“需要管理员权限”。
- `give` 使用专用表单，但仍以数据包的物品/附魔注册表作为选项来源。

## 6. 新增一个版本

1. 运行 `node tools/pipeline/build-pack.mjs --version 26.4-snapshot-5`。
2. `packs/index.json` 自动追加；主程序会在设置里列出。
3. 若该版本命令语法与 26.3 有差异，先在 `commandTree.ts` / `item.ts` 里补适配，再加回归用例。
4. 重新打包时 `extraResources` 会包含全部 `packs/*`；也可以用 `MCSTUDIO_PACKS_DIR` 指向外部目录做测试。

## 7. 许可与来源标注

- 不随安装包分发 Mojang jar、材质、语言文件。
- 数据包仅包含从官方数据生成器得到的命令树、注册表、方块状态与组件默认值，属于功能性数据。
- 关于页与 README 均声明：非官方产品，与 Mojang/Microsoft 无关联。
- 命令中文说明为原创文案；不复制 Minecraft Wiki（CC BY-NC-SA）或 CBC 文案。
