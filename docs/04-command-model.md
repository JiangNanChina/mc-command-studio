# 04 · 命令模型

## 1. 当前实现的两条路径

首版没有强行抽象“所有命令的 AST”，而是分成两条可靠路径：

### 1.1 专用表单：`give`

```ts
interface GiveOptions {
  target: Selector
  item: ItemStack
  count: number
}

interface ItemStack {
  id: string
  components: ItemComponent[]
}

type ItemComponent =
  | { kind: 'custom_name'; text: string; color?: string; italic: boolean }
  | { kind: 'lore'; lines: TextLine[] }
  | { kind: 'enchantments'; entries: { id: string; level: number }[] }
  | { kind: 'unbreakable' }
  | { kind: 'max_stack_size'; value: number }
  | { kind: 'custom_model_data'; raw: string }
```

`buildGiveCommand(options)` 输出 `{ text, diagnostics }`。

### 1.2 通用构建器：所有 94 个根命令

```ts
interface GenericStep {
  name: string       // 命令树 children 的键
  node: CommandNodeData
  value?: string     // argument 的原始文本
}
```

`serializeGeneric(root, steps)` 把命令名、字面量、参数原文用空格拼接，并对常见参数类型做基础校验。

> P1 会把两条路径统一为 `CommandDraft` AST，让文本导入、撤销/重做与单元引用共享同一结构。当前先保证端到端可用。

## 2. 序列化规则

### 2.1 空值

- `count === 1` 时省略 `/give` 的数量参数。
- 没有组件时不输出 `[]`。
- 选择器没有筛选条件时只输出 `@s`。

### 2.2 SNBT 字符串

```ts
snbtString('a "b"') // "a \"b\""
snbtString('C:\\temp') // "C:\\temp"
```

处理 `\`、`"`、换行、回车、制表符。命令方块内层命令使用同一规则：`Command:"give …"`。

### 2.3 物品

| 组件 | 输出示例 |
|---|---|
| `custom_name` | `custom_name={text:"Excalibur",color:"gold",italic:false}` |
| `lore` | `lore=[{text:"第一行",color:"gray",italic:false}]` |
| `enchantments` | `enchantments={sharpness:5,knockback:2}`（1.21+ 扁平映射） |
| `unbreakable` | `unbreakable={}` |
| `max_stack_size` | `max_stack_size=16` |
| `custom_model_data` | `custom_model_data={strings:["my_pack:model"]}` |

`minecraft:` 前缀在组件键里省略，非原版命名空间加引号（`"mypack:custom":1`）。

### 2.4 选择器

固定顺序：`name, type, tag, distance, level, gamemode, limit, sort, x, y, z, dx, dy, dz, scores, nbt, team`。

```text
@e[name="Steve",type=minecraft:zombie,distance=0..10,limit=2,sort=nearest,scores={kills=1..5},nbt={NoAI:1b}]
```

`@e` / `@n` 用在 `/give` 时给出警告（目标必须是玩家）。

### 2.5 命令方块

```text
setblock 0 64 0 minecraft:command_block[facing=up]{Command:"give @s minecraft:stone",auto:0b,conditionMet:0b,powered:1b,TrackOutput:0b,UpdateLastExecution:0b}
```

- `facing` 支持六向；`conditional=true` 仅在勾选时写入。
- 坐标支持绝对、`~` 相对与 `^` 局部。
- 命令内换行直接判错（命令方块不支持多行）。
- 超过 32,500 字符判错。

## 3. 参数解析器

命令树里出现 59 种 parser。当前处理分三档：

| 档位 | 类型 | 编辑器 |
|---|---|---|
| 基础校验 | `brigadier:integer/double/float/long/bool/string`、`minecraft:time`、`int_range/float_range`、`hex_color`、`uuid` | 数字/文本输入 + 范围/格式校验 |
| 结构校验 | `block_pos/column_pos/vec3/vec2/rotation`、`entity`、`resource_location`、`nbt_tag/nbt_compound_tag`、`item_stack`、`block_state`、`item_predicate`、`gamemode` | 文本 + 专用提示/基础语法校验；选择器/物品有独立编辑器 |
| 原始输入 | 其余（`particle`、`dialog`、`loot_table`、`objective_criteria`、`slot_source` 等） | 文本 + 类型说明，P1 补专用面板 |

未知 parser 不会阻塞生成，界面显示“该参数类型暂无专用编辑器”。

## 4. 校验级别

| 级别 | 例子 | 行为 |
|---|---|---|
| error | 物品 ID 为空、数量 < 1、NBT 括号不配对、命令含换行 | 红条；复制仍允许（便于手动修） |
| warn | `/give` 使用 `@e`、数量 > 99、颜色非法、控制字符 | 黄条；不阻止输出 |
| info | 权限提示、复制后的使用说明 | 蓝条 |

UI 在输出面板与状态栏同时显示错误/警告数量。

## 5. 单元体系（P1）

计划把可复用值抽成项目内命名单元：

```ts
type Unit =
  | { id: string; kind: 'item'; name: string; value: ItemStack }
  | { id: string; kind: 'selector'; name: string; value: Selector }
  | { id: string; kind: 'text'; name: string; value: TextComponent }
  | { id: string; kind: 'block'; name: string; value: BlockState }
  | { id: string; kind: 'enchantments'; name: string; value: EnchantmentEntry[] }
```

命令里保存 `{ kind: 'ref', unitId }`，序列化时内联；项目文件同时保存单元表。这样修改一个“传说剑”单元，所有引用它的命令一起更新。

## 6. 文本 → 表单（P1）

不实现完整 Brigadier 解析器，而是：

1. 用命令树做最长字面量匹配，定位根命令与子命令路径。
2. 对 `give` / 选择器 / 物品先做结构化解析；失败时保留原文。
3. 其余参数保留为 raw，表单仍可编辑可复制。
4. 目标覆盖率：粘贴一条命令后，至少能识别出正确的根命令与修改入口。

## 7. 测试

`packages/core/src/*.test.ts` 共 50 个用例，覆盖：

- SNBT / 命令方块字符串转义。
- 选择器排序、引号、范围、NBT 括号、分数。
- 物品 6 类组件、重复组件、非法等级。
- `/give` 数量、选择器警告。
- `/setblock` 朝向、条件、换行、坐标。
- 命令树遍历、通用路径、参数范围。
- 数据包 manifest、注册表选择。
- SemVer 比较、项目文件 schema。

运行：`pnpm test`。
