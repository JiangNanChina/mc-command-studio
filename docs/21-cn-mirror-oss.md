# 21 · 阿里云 OSS 国内镜像：成本与操作步骤

> 目标：给 `electron-updater` 提供一个国内可稳定访问的 `generic` 更新源，替代/兜底 GitHub Releases。
> 结论先行：**存储和请求费基本可忽略，成本 99% 是外网流出流量，约 0.06 元/次全量下载**；月 1,000 次更新 ≈ 60 元，月 200 次 ≈ 12 元。
>
> **实现状态（2026-10-29）**：客户端双源逻辑与 CI 同步工作流已落地，见 §3 Step 6 / Step 7。
> OSS 侧现状：`mcstudio-cn`（成都，标准/本地冗余）已存在且已公共读，只差上传文件；GitHub Secrets 仍未配置。

## 1. 成本模型

### 1.1 实际产物大小（v0.7.0 实测）

| 文件 | 字节 | 折算 |
|---|---:|---:|
| `MC-Command-Studio-Setup-0.7.0.exe` | 133,202,947 | 127.0 MiB / 0.124 GiB |
| `MC-Command-Studio-0.7.0-portable.exe` | ≈ 117,000,000 | ≈ 111.6 MiB |
| `MC-Command-Studio-Setup-0.7.0.exe.blockmap` | ≈ 139,000 | ≈ 136 KiB |
| `latest.yml` | ≈ 363 | — |

### 1.2 阿里云 OSS 计费单价（中国大陆地域，参考价）

| 计费项 | 单价 | 说明 |
|---|---|---|
| 存储（标准·本地冗余） | **0.12 元/GB/月** | 官方文档示例价；长期合约/优惠可能到 0.09 |
| 外网流出流量·忙时（08:00–24:00） | **0.50 元/GB** | 只有"下方向"收费 |
| 外网流出流量·闲时（00:00–08:00） | **0.25 元/GB** | 同一计费项的分时价 |
| 外网流入流量（上传） | **免费** | CI 上传不花钱 |
| 内网流出（同地域 ECS） | 免费 | 用不到，可忽略 |
| CDN 回源流出 | 0.15 元/GB | 仅启用 CDN 时产生 |
| 请求（GET/PUT） | 约 0.01 元/万次 | 1 万次下载才 1 分钱，可忽略 |

> 单价以[控制台实时报价](https://www.aliyun.com/price/product#/oss/detail/oss)为准；上表用于量级估算。
> 新用户有 **20GB 存储 / 2GB 外网流出流量 / 20 万请求（3 个月）** 免费额度——2GB 只够约 16 次全量下载，实际意义有限。

### 1.3 单次更新成本

| 场景 | 流量 | 成本（忙时 0.5 元/GB） |
|---|---:|---:|
| 全量下载安装包 | 0.124 GiB | **≈ 0.062 元** |
| 差异更新（典型补丁版，只下 20–40%） | ≈ 0.03–0.05 GiB | **≈ 0.015–0.025 元** |
| 便携版下载（如也放镜像） | 0.109 GiB | ≈ 0.055 元 |

差异更新依赖旧版本 `.blockmap` 仍在源上（`docs/08` §7 已注明），所以镜像里要同时保留最近 3 个版本的 blockmap。

### 1.4 月度成本（只算安装版自动更新）

| 月更新次数 | 月流量 | 按量付费（忙时价） | 备注 |
|---:|---:|---:|---|
| 50 | 6.2 GB | **≈ 3 元** | 个人项目，基本等于免费 |
| 100 | 12.4 GB | **≈ 6 元** | |
| 200 | 24.8 GB | **≈ 12 元** | |
| 500 | 62 GB | **≈ 31 元** | 开始值得看流量包 |
| 1,000 | 124 GB | **≈ 62 元** | 100GB/月 年包（约 441 元/年）更划算 |
| 5,000 | 620 GB | **≈ 310 元** | 建议上 CDN + 备案域名 |
| 10,000 | 1,240 GB | **≈ 620 元** | |

存储侧（保留 3 个版本 ≈ 0.7 GiB）：**≈ 0.08 元/月**，可忽略。
请求侧：1,000 次更新 ≈ 2 万次请求 ≈ **0.02 元**，可忽略。

**一句话公式**：`月成本 ≈ 月下载次数 × 0.124 × 0.5 + 0.1`

### 1.5 什么时候买流量包

| 规格 | 参考价 | 折算 | 适用 |
|---|---:|---:|---|
| 100GB 下行流量包 / 月 | 49 元 | 0.49 元/GB | 几乎没优惠，不如按量 |
| 100GB 下行流量包 / 年（买9送3） | 441 元 | ≈ 0.37 元/GB | 月流量稳定 >100GB 时买 |
| 1TB 下行流量包 / 年 | 4,545 元 | ≈ 0.37 元/GB | 月 8,000+ 次下载 |

> 结论：**月下载 < 500 次不要买包**，按量付费更省心；超过后再买年包。

## 2. 动手前必须知道的 5 个前提

1. **默认域名不需要 ICP 备案**：`https://<bucket>.oss-cn-chengdu.aliyuncs.com/...` 可直接给客户端用。
   **绑定自定义域名则必须备案**（且备案通常要借 ECS/轻量应用服务器拿备案服务码，OSS 本身不提供），这也是为什么本方案先用默认域名。
2. **CDN 大陆加速域名同样要备案**，不备案就只能 OSS 直连。所以"先 OSS 直连、量大再 CDN"是正确顺序。
3. **`latest.yml` 必须禁缓存**：否则用户会长时间看到旧版本号。`.exe` 文件名自带版本号，可以长缓存。
4. **差异更新要 `useMultipleRangeRequest: false`**：OSS 对单段 `Range` 支持很好，但 electron-updater 的 generic 渠道默认开启多段 Range 请求，对非 S3 源可能失效并回退全量下载。
5. **`publish` 数组不能做双源**：electron-builder 官方明确"自动更新只使用列表里的第一个 provider"，写进 `app-update.yml` 的只有一个。要做"国内优先 + GitHub 兜底"，必须在客户端代码里切换 feed。

## 3. 操作步骤

### Step 0 · 开通

1. 阿里云账号完成实名认证。
2. 控制台搜索「对象存储 OSS」→ 开通（免费）。
3. 可选：在[免费试用](https://free.aliyun.com)领 20GB/3 个月额度。

### Step 0.5 · 一键完成（推荐）

**全流程**：版本校验 → typecheck / 单测 → 构建 → 上传 OSS → 写 Secrets → 镜像体检。

```powershell
pnpm release:oss
```

**只补上传**（`release/` 里已有当前版本产物）：

```powershell
pnpm oss:setup
```

凭据没有走环境变量时会现场提示输入，Secret 不回显、不写进命令历史；也可以提前设好：

```powershell
$env:OSS_BUCKET = 'mcstudio-cn'
$env:OSS_ENDPOINT = 'oss-cn-chengdu.aliyuncs.com'   # 不要带 https://
```

`setup-oss` 依次做 6 件事：

1. 检查凭据，定位或下载 ossutil 1.7.19；
2. 建 Bucket（已存在则跳过）；
3. 设为公共读；
4. 上传 `release/` 里的 exe / blockmap / checksums；
5. 单独上传 `latest.yml` 并设 `Cache-Control: no-cache`；
6. 打印镜像地址，写入 4 个 GitHub Secrets（`-- --skip-secrets` 可跳过），最后跑 `pnpm mirror:check`。

说明：

- **凭据安全**：不要把 AccessKey 贴到聊天、issue、截图或工单里——一旦发出就按泄露处理并立即轮换。只在本机会话用环境变量或 `Read-Host` 输入，不要写进仓库文件。
- 用 **RAM 子账号**，不要用主账号 AccessKey；跑完可到 RAM 控制台禁用这个 AK。
- 脚本只新增/覆盖对象，不删除旧版本，差异更新依赖的旧 blockmap 会保留。
- 初始化需要 `oss:PutBucket`、`oss:PutBucketAcl`；CI 用的最小策略（Step 7）不需要这两条，可以初始化后收回。
- `pnpm release:oss` 上传完会问一句"是否打 tag 并推送"，回车即停在"镜像已就绪"；要全自动就 `pnpm release:oss -- --publish`，跳过单测 `-- --skip-tests`。
- 脚本是 Node 写的（`tools/release/release-oss.mjs` / `setup-oss.mjs`），不依赖 PowerShell 7；`.ps1` 只是转发壳。
- 不想用脚本就按下面 Step 1–5 手动做，结果一样。

### Step 1 · 创建 Bucket（已完成 ✅）

> 2026-10-29：`mcstudio-cn` 已在成都建好，公共读。下面的表格留作参考，新桶照此配置即可。
>
> **踩坑记录**：Bucket 已存在时，用 **RAM 用户 AK** 调 `PutBucket` 一定返回 `BucketAlreadyExists`（官方行为，只有主账号能重复创建自己的桶）。脚本已把这条当成"已存在，跳过"，不再据此判断归属。

| 配置项 | 取值 | 说明 |
|---|---|---|
| 地域 | 西南1（成都）`oss-cn-chengdu` | **当前就是成都**；换地域要同步改 `DEFAULT_MIRROR_URL` |
| Bucket 名称 | 例 `mcstudio-cn` | 全局唯一、全小写 |
| 存储类型 | 标准存储 | 低频/归档有取回延迟与费用，别选 |
| 冗余类型 | 本地冗余 LRS | 同城冗余 ZRS 贵约 30%，没必要 |
| ACL | **公共读** | 客户端要匿名下载；不要开"阻止公共访问" |
| 版本控制 | 关闭 | |
| 服务端加密 | 可不启用 | 启用也不影响下载 |

创建后记录：`oss-cn-chengdu.aliyuncs.com`（Endpoint）、`mcstudio-cn`（Bucket）。

> 2026-10-29 实测：匿名访问 `.../mc-command-studio/updates/latest.yml` 返回 `NoSuchKey`（而不是 `AccessDenied`），说明**公共读已生效**，只差上传文件。

> 安全提示：公共读 = 任何人拿到 URL 都能下。这是自动更新的代价；防护手段见 §5。

### Step 2 · 目录结构

```
oss://mcstudio-cn/mc-command-studio/updates/
  latest.yml                              ← 稳定渠道
  beta.yml                                ← 可选，设置里切 beta 时用
  MC-Command-Studio-Setup-0.7.0.exe
  MC-Command-Studio-Setup-0.7.0.exe.blockmap
  MC-Command-Studio-Setup-0.6.1.exe.blockmap   ← 保留，供差异更新
  MC-Command-Studio-Setup-0.6.0.exe.blockmap   ← 保留
  MC-Command-Studio-0.7.0-portable.exe         ← 可选
  checksums.txt                                ← 可选，方便用户校验
```

对应公网地址（注意结尾斜杠）：

```
https://mcstudio-cn.oss-cn-chengdu.aliyuncs.com/mc-command-studio/updates/
```

### Step 3 · 上传（首次：控制台）

控制台 → Bucket → 文件管理 → 上传文件 → 拖入 `release/latest.yml`、`*.exe`、`*.blockmap`。
上传后在文件详情里设置响应头（Step 4）。

### Step 4 · 设置响应头（关键，别跳）

| 对象 | Content-Type | Cache-Control |
|---|---|---|
| `latest.yml` / `beta.yml` | `text/yaml` | `no-cache` |
| `*.exe` | `application/octet-stream` | `public, max-age=31536000` |
| `*.exe.blockmap` | `application/octet-stream` | `public, max-age=31536000` |

控制台路径：文件 → 详情 → 「设置 HTTP 头」。
或 ossutil：

```bash
# 标准 HTTP 头用 set-meta 设置（-f 跳过交互确认），分隔符是 #
ossutil set-meta oss://mcstudio-cn/mc-command-studio/updates/latest.yml \
  "Cache-Control:no-cache#Content-Type:text/yaml" -f
```

### Step 5 · 验证源可用

```bash
BASE=https://mcstudio-cn.oss-cn-chengdu.aliyuncs.com/mc-command-studio/updates

# 1) 元数据可读、内容正确
curl -sI $BASE/latest.yml          # 期望 200，Cache-Control: no-cache
curl -s  $BASE/latest.yml | head   # 期望 version: <当前版本>

# 2) 支持 Range（差异更新前提）
curl -s -o /dev/null -w "%{http_code}\n" -r 0-1023 $BASE/MC-Command-Studio-Setup-0.7.0.exe
# 期望 206

# 3) 文件完整
curl -sL -o /tmp/setup.exe $BASE/MC-Command-Studio-Setup-0.7.0.exe
certutil -hashfile /tmp/setup.exe SHA256     # 与 checksums.txt 对比
```

配好 OSS 之后，用一条命令做完整校验：

```bash
pnpm mirror:check
# 或指定其它地址
pnpm mirror:check https://cdn.example.com/mc-command-studio/updates/
```

它检查四件事：`latest.yml` 可读、版本与 GitHub 一致、`Cache-Control` 是 `no-cache`、安装包支持 Range。任何一项不过都会以非 0 退出，适合放进发布后的值守脚本。

### Step 6 · 客户端接入（已实现）

双源逻辑已内置，**不需要改 `electron-builder.yml`**。行为：

| 场景 | 行为 |
|---|---|
| 正式版（安装版） | 先查国内镜像，失败或镜像无更新时再查 GitHub |
| 镜像落后于 GitHub | 两个源都问，取"比当前版本更新"的那个，避免镜像掉队导致收不到更新 |
| 两个源都不可达 | 状态显示"检查更新失败"，并带上每个源的错误 |
| 镜像首次检查失败 | 本次运行内不再尝试镜像（重启后恢复），避免每次检查都卡到 socket 超时 |
| 本地测试版（版本号含 `-test`） | 只用打包内置的 `app-update.yml`，不碰线上镜像 |
| 设置了 `MCSTUDIO_UPDATE_URL` | 只用这一个源，不做回退（本地联调 / 紧急切换） |

实现位置：

- `apps/desktop/src/main/updateFeeds.ts`：源解析与多源结果汇总（纯函数，带单测）
- `apps/desktop/src/main/updater.ts`：按顺序探测、屏蔽中间状态、最后统一下发
- `apps/desktop/src/shared/types.ts`：`UpdateState.source`，设置页显示"本次：国内镜像 / GitHub"

两个环境变量：

| 变量 | 作用 |
|---|---|
| `MCSTUDIO_UPDATE_URL` | 强制单一 generic 源（保持原有行为） |
| `MCSTUDIO_UPDATE_MIRROR` | 换镜像地址；填 `off` 关闭镜像、退回纯 GitHub |

要换默认镜像地址，改 `updateFeeds.ts` 里的 `DEFAULT_MIRROR_URL`，并同步本文档。

> 为什么不直接在 `electron-builder.yml` 里加第二个 provider：electron-builder 只会把 `publish` 列表的第一个写进 `app-update.yml`，写多个无效；兜底必须在运行时用 `setFeedURL` 切换。

### Step 7 · CI 自动同步（已实现）

工作流文件：[.github/workflows/mirror.yml](../.github/workflows/mirror.yml)

触发条件：Release 从 draft 转为 **published**（或手动 `workflow_dispatch` 指定 tag）。

它做的事：

1. `gh release download` 拉取该 tag 的安装包、blockmap、`latest.yml`、`checksums.txt`；
2. 安装 ossutil 1.7.19（固定版本，官方下载地址）；
3. **先**上传 exe / blockmap / checksums，**最后**上传 `latest.yml`（`Cache-Control: no-cache`），实现原子切换；
4. 回读 `latest.yml` 校验版本号与 tag 一致，再列出目录。

需要在仓库 Settings → Secrets and variables → Actions 配置 4 个 secret：

| Secret | 值 |
|---|---|
| `OSS_BUCKET` | `mcstudio-cn` |
| `OSS_ENDPOINT` | `oss-cn-chengdu.aliyuncs.com`（**不要带 `https://`**） |
| `OSS_ACCESS_KEY_ID` | RAM 子账号 AccessKey ID |
| `OSS_ACCESS_KEY_SECRET` | RAM 子账号 AccessKey Secret |

> `pnpm oss:setup` 默认会顺带写入这 4 个 Secrets（需要 `gh` 已登录且有仓库 admin 权限）；不想写就加 `-- --skip-secrets`。

RAM 子账号最小权限策略（只允许写这一个前缀）：

```json
{
  "Version": "1",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["oss:ListObjects"],
      "Resource": ["acs:oss:*:*:mcstudio-cn"]
    },
    {
      "Effect": "Allow",
      "Action": ["oss:PutObject", "oss:GetObject", "oss:GetObjectAcl"],
      "Resource": [
        "acs:oss:*:*:mcstudio-cn/mc-command-studio/updates",
        "acs:oss:*:*:mcstudio-cn/mc-command-studio/updates/*"
      ]
    }
  ]
}
```

> `set-meta` 还需要 `oss:GetObjectAcl`（上面已包含）。用 `pnpm oss:setup` 做一次性初始化时，另外需要 `oss:PutBucket`、`oss:PutBucketAcl`，可以临时授予，初始化完收回。

要点：
- 旧版 `*.blockmap` 不要删，保留最近 3 个版本，否则差异更新退回全量。
- 首次建镜像时先手动补传最近 3 个版本的 `*.blockmap`。
- 它是独立 workflow，镜像失败不会阻塞 GitHub 发布。

### Step 8 · 端到端验收

1. 安装 **0.6.1**（旧版）。
2. 以镜像地址启动（仅本次生效，用于验证）：

```powershell
$env:MCSTUDIO_UPDATE_URL = "https://mcstudio-cn.oss-cn-chengdu.aliyuncs.com/mc-command-studio/updates/"
& "$env:LOCALAPPDATA\Programs\MC Command Studio\MC Command Studio.exe"
```

3. 设置 → 软件更新 → 检查更新：应看到 `v0.7.0`。
4. 下载进度到 100% → 重启安装 → 版本变为 0.7.0，项目与设置保留。
5. 回到 OSS 控制台「用量查询」：应出现几 MB～百 MB 的**外网流出流量**（差异更新的话远小于 127MB）。
6. 断网重试：应静默失败，不影响编辑。

### Step 9 · 成本保护与运维

| 措施 | 做法 |
|---|---|
| 用量告警 | 云监控 → 报警规则 → OSS 外网流出流量 / 请求数，阈值按预估 2 倍设 |
| 预算告警 | 费用中心 → 预算管理 → 月预算（如 50 元）→ 80% 告警 |
| 保留策略 | 只留最近 3 个版本的 `exe` + `blockmap`，其余手动删或配生命周期规则 |
| 防刷 | **不要开 Referer 防盗链**（Electron 请求不带 Referer，会把自己挡死）；可用 Bucket Policy 拒绝异常 IP |
| 止损 | 流量异常时把 Bucket ACL 改为私有（立即停止对外分发），排查后再放开 |
| 升级路径 | 月流量超过 ~500GB 再考虑 CDN（需备案域名）+ 用量封顶 |

## 4. 与其它方案对比

| 方案 | 成本（月 1,000 次） | 国内速度 | 门槛 |
|---|---:|---|---|
| **阿里云 OSS 直连** | ≈ 62 元 | 快且稳定 | 实名认证；默认域名免备案 |
| 阿里云 OSS + CDN | ≈ 30–40 元 + 回源 | 更快 | 需备案域名，配置更复杂 |
| 腾讯云 COS 直连 | 同量级（≈ 0.5 元/GB） | 相当 | 同阿里云 |
| Cloudflare R2 | 出网 0 元 | 国内波动大 | 无备案，但延迟/丢包不稳定 |
| GitHub Releases | 0 元 | 国内经常失败 | 已有 |

> 结论：**月下载 < 1,000 次时，OSS 直连的几十元是买"国内能更新成功"的保险**，比自建 CDN 划算得多。

## 5. 常见坑

1. **URL 结尾少斜杠** → electron-updater 拼出 `...updateslatest.yml`。
2. **`latest.yml` 被缓存** → 用户永远检测不到新版本（CDN/浏览器 304）。
3. **只传了新 exe 没传 latest.yml** → 用户看到旧版本；反之先传 `latest.yml` 会让用户下到 404。
4. **删了旧 blockmap** → 差异更新退回全量，流量翻 3 倍。
5. **开 Referer 防盗链** → 客户端全部 403。
6. **`useMultipleRangeRequest` 没关** → 差异更新随机失败后回退全量。
7. **备案误解**：默认域名可上线，自定义域名不可。
8. **把 OSS 写成私有** → electron-updater 拿不到文件（除非做签名 URL 服务，复杂度陡增）。
9. **未签名 exe**：OSS 不会改善 SmartScreen；该配证书还是要配（`docs/08` §5）。
10. **构建报 `remove ...esbuild-xxxx: Access is denied`**：esbuild 在系统 `%TEMP%` 建/删临时目录被杀软或 ACL 拦了。`pnpm release:oss` 已自动把 `TEMP` 指到仓库内 `.tmp/` 并重试一次；仍失败就给仓库目录和 `%TEMP%` 加杀软排除项，或先手动 `set TEMP=%CD%\.tmp` 再 `pnpm build:win`。

## 6. 与现有文档的衔接

- 更新机制与状态机：`docs/08-release-update.md` §2
- 更新源配置与 `MCSTUDIO_UPDATE_URL`：`docs/08-release-update.md` §3.2
- 发布检查清单：`docs/07-roadmap-risks.md` §5
- 计划中的"国内镜像"条目：`docs/18-next-plan.md` P2
