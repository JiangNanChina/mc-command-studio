# 18 · 0.6.0 之后的开发计划

## 已完成基线

| 项 | 值 |
|---|---:|
| 正式版 | v0.6.0 |
| 正式版本 | 54（45 基础 + 9 别名） |
| 26.3 覆盖 | 94 / 94 |
| 1.12.2 覆盖 | 64 / 64 |
| NBT 安全快捷表单 | 44 |
| 快捷表单 | 53 |
| 旧版工具 | 34 |
| 单元测试 | 276 |
| 资源审计 | 45 个基础包 0 缺失 |

## P0：NBT 深度

- [x] execute 子命令按当前版本命令树过滤
- [x] execute 条件类型按命令树过滤
- [x] data 动作按版本过滤（1.13 不显示 modify）
- [x] item NBT 字段
- [x] summon NBT 字段
- [x] attribute reset 版本过滤
- [x] particle 旧版参数模式
- [ ] loot replace 动作
- [ ] NBT item / entity 预设库
- [ ] 1.13–1.20.4 逐版本游戏内验证

## P1：10 个版本表单

- [x] place：structure / template / jigsaw
- [x] test：run / create / pos / reset
- [x] compute：float / integer provider 注册表
- [x] dialog：show / clear
- [x] waypoint：list / color / hex / reset / style
- [x] stopwatch：create / query / remove / restart
- [x] swing：hand / animation / duration
- [x] fetchprofile：name / id / entity
- [x] transfer：host / port / players
- [x] posteffect：add / clear / list / remove
- [ ] 逐版本字段截图与游戏内验证

## P1：1.12.2

- [x] 64 / 64 根命令入口
- [x] admin / block / world / misc 分组
- [x] teleport 支持 tp / teleport
- [x] block mask / mode
- [x] time query
- [ ] 分组表单逐项游戏内验证

## P1：体验与质量

- [x] 45 个基础包图标与中文名审计通过
- [x] 旧版本别名映射抽到 `legacy-assets.json`
- [x] 更新版本比较支持 test prerelease
- [x] 正式版更新按钮改为“重新载入”
- [x] 本地测试版独立更新源
- [ ] 更新 UI 自动化 E2E
- [ ] 全量 10 表单逐版本截图
- [ ] 45 个基础包游戏内抽样验证

## P2：发布基础设施

- [ ] 代码签名
- [ ] 国内镜像
- [ ] 便携版自动更新或明确提示
- [ ] 更新失败回滚提示

## 下一版建议

**v0.7.0**

1. loot replace / NBT 预设库
2. 10 个版本表单逐版本截图
3. 更新 UI E2E
4. 6 个关键版本游戏内验证
5. 代码签名/镜像仍按用户确认后再做
