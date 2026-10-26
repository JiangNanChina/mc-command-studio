# 09. 中文名称与图标资源

## 来源

- 游戏版本：Minecraft Java 26.3（官方 release）。
- 中文名称：26.3 `assets/minecraft/lang/zh_cn.json`（Mojang 客户端资源索引）。
- 物品/方块图标：26.3 客户端 jar 中的 `textures/item` 与 `textures/block`；缺失时回退到模型 JSON 的 `layer0` / `particle` / `side` 等引用。
- 状态效果、附魔、实体：没有独立物品材质，使用中文首字 + 哈希配色的占位图标。

这些资源仅用于在编辑器中识别游戏对象，不改变或再分发游戏本体；本项目与 Mojang / Microsoft 无关联。

## 生成文件

| 文件 | 内容 |
|---|---|
| `apps/desktop/src/renderer/src/data/mc-names.json` | 物品/方块/效果/附魔/实体的中文名 |
| `apps/desktop/src/renderer/src/data/mc-icons.json` | 图集行列、每类 ID → 图集索引 |
| `apps/desktop/src/renderer/src/assets/mc-icons.png` | 2048×1600 图标图集（32px 单元、64 列） |
| `apps/desktop/src/renderer/src/lib/mcAssets.ts` | 名称/索引查询 |
| `apps/desktop/src/renderer/src/components/McIcon.tsx` | 图集渲染 + 占位图标 |

覆盖量：

- 物品 1,476/1,658 使用真实材质，其余占位图标。
- 方块 994/1,286 使用真实材质，其余占位图标。
- 效果 40、附魔 43、实体 161 使用占位图标。

## 重新生成

```powershell
# 1. 下载 26.3 客户端 jar 和 zh_cn.json（见 docs/08 的网络代理说明）
# 2. 生成
python tools/assets/build_mc_assets.py `
  --jar artifacts/client-26.3.jar `
  --lang artifacts/zh_cn.json `
  --pack packs/26.3/registries.json `
  --out-app apps/desktop/src/renderer/src
```

脚本只读取本地 jar、注册表和语言文件，不联网。图标图集约 1.3 MB，随应用打包。

## 后续改进

- 用方块模型渲染真正的等距方块图标，而不是平面材质。
- 状态效果按药水颜色着色，附魔使用附魔书图标，实体使用刷怪蛋颜色。
- 允许用户选择资源包覆盖图标。
