# 版本特定快捷表单能力矩阵

## 可用版本

| 表单 | 起始版本 | 关键子命令 |
|---|---|---|
| place | 1.19 | structure / feature / template / jigsaw |
| transfer | 1.20.5 | hostname / port |
| test | 1.21.5 | run / clearall |
| dialog | 1.21.6 | show / clear |
| waypoint | 1.21.6 | list / modify |
| stopwatch | 1.21.11 | create / query / remove / restart |
| swing | 26.1 | targets / mainhand / offhand |
| fetchprofile | 26.1 | name / id / entity |
| compute | 26.3 | block / default / entity |
| posteffect | 26.3 | add / clear / list / remove |

## 实现方式

### 命令树过滤

快捷表单读取当前数据包命令树：

- 根命令不存在：侧栏不显示
- 子命令不存在：对应下拉项被过滤
- 版本切换：表单字段重置为该版本默认值

### NBT 兼容

1.13–1.20.4 可安全使用 **44 个快捷表单**，包括：

```text
locate / help / reload / seed / list / version / publish
save-all / save-off / save-on / stop / unpublish
kill / kick / op / deop / say / me / setidletimeout
ban / ban-ip / banlist / pardon / pardon-ip / whitelist
tell / msg / tm / teammsg / w
teleport / experience / defaultgamemode / trigger
fillbiome / spectate / recipe / return / perf / jfr / debug / place
replaceitem / locatebiome
```

剩余 10 个属于版本特定表单，仅在命令树具备对应子命令时可用。

## 验证

```bash
node tools/pipeline/verify-quick-matrix.mjs
```

- 覆盖 45 个基础包
- 输出每个版本的 10 项能力
- 与数据包命令树一致

## 当前状态

- 26.3 可视化入口：94 / 94
- 快捷表单：53
- NBT 安全快捷表单：44
- 版本特定快捷表单：10
- 单元测试：273
