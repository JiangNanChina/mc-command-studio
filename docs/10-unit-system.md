# 10. 单元体系

`packages/core/src/units.ts` 提供命令构建器共享的最小值对象与校验，避免每个命令重复实现资源 ID、数值、物品栈和槽位规则。

## 单元

| 单元 | API | 说明 |
|---|---|---|
| 资源 ID | `parseResourceLocation` / `formatResourceLocation` / `isValidResourceLocation` | 补全 `minecraft:`，校验 `namespace:path` |
| 数值 | `parseNumberUnit` | 数字、整数、min/max 约束 |
| 物品栈 | `parseItemStackUnit` / `itemStackText` | 资源 ID + 1–99 数量 |
| 槽位 | `isValidSlot` | `weapon.mainhand`、`container.0` 等 |

## 已接入

- `advancement`：进度资源名校验。
- `function` / `schedule`：函数资源名校验。
- `attribute`：属性/修饰符资源名与数值校验。
- `item`：物品/修饰符资源名、数量、槽位校验。
- 数据包高级文件：资源名与 JSON 结构校验。

## 原则

1. 表单只保存原始字符串，构建器负责归一化与校验。
2. 资源 ID 默认补全 `minecraft:`，但修饰符等玩家自定义 ID 仍要求显式命名空间。
3. 校验错误使用稳定的 `code`，便于 UI 定位字段。
4. 单元测试覆盖边界值，新增命令优先复用这些单元。
