# 18 · 0.6.0 之后的开发计划

## 已完成基线

| 项 | 值 |
|---|---:|
| 正式版 | v0.6.0（0.6.1 待发布） |
| 正式版本 | 54（45 基础 + 9 别名） |
| 26.3 覆盖 | 94 / 94 |
| 1.12.2 覆盖 | 64 / 64 |
| NBT 安全快捷表单 | 44 |
| 快捷表单 | 53 |
| 旧版工具 | 34 |
| 单元测试 | 277 |
| 资源审计 | 45 个基础包 0 缺失 |

## P0：NBT 深度

- [x] execute 子命令按当前版本命令树过滤
- [x] execute 条件类型按命令树过滤
- [x] data 动作按版本过滤（1.13 不显示 modify）
- [x] item NBT 字段
- [x] summon NBT 字段
- [x] attribute reset 版本过滤
- [x] particle 旧版参数模式
- [x] loot replace 动作
- [x] NBT item / entity 预设库
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
- [x] 10 个版本表单逐版本截图
- [ ] 逐版本游戏内验证

## P1：1.12.2

- [x] 64 / 64 根命令入口
- [x] admin / block / world / misc 分组
- [x] teleport 支持 tp / teleport
- [x] block mask / mode
- [x] time query
- [x] 分组表单冒烟
- [ ] 分组表单游戏内验证

## P1：体验与质量

- [x] 45 个基础包图标与中文名审计通过
- [x] 旧版本别名映射抽到 `legacy-assets.json`
- [x] 更新版本比较支持 test prerelease
- [x] 正式版更新按钮改为“重新载入”
- [x] 本地测试版独立更新源
- [x] 更新 UI 自动化 E2E
- [x] 更新 UI 完整下载/安装 E2E（test.3 → test.4）
- [x] 1.13 manifest 修复与目录回归
- [x] 全量 10 表单逐版本截图
- [x] 全部 54 个版本加载验证
- [ ] 45 个基础包游戏内抽样验证

## P2：发布基础设施

- [ ] 代码签名
- [ ] 国内镜像：客户端双源、`mirror.yml` 同步、`pnpm release:oss` 一键发布均已实现（见 [21-cn-mirror-oss.md](21-cn-mirror-oss.md)）；桶 `mcstudio-cn`（成都）已就绪，待上传文件 + 写 Secrets
- [x] 便携版更新提示（`updater.ts` 已提示手动下载）
- [ ] 更新失败回滚提示

## 下一版建议

**v0.6.1**

1. [ ] 6 个关键版本游戏内验证（待真机）
2. [x] 1.13 manifest 修复回归
3. [x] 更新 UI 下载/安装完整 E2E（0.5.1-test.3 → test.4）
4. [ ] 代码签名/镜像仍按用户确认后再做
