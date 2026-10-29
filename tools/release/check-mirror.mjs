#!/usr/bin/env node
/**
 * 校验国内镜像是否与 GitHub 同步，并检查差异更新需要的 Range 支持。
 *
 * 用法：
 *   node tools/release/check-mirror.mjs
 *   node tools/release/check-mirror.mjs https://cdn.example.com/mc-command-studio/updates/
 *
 * 默认地址与 apps/desktop/src/main/updateFeeds.ts 的 DEFAULT_MIRROR_URL 保持一致。
 */
const DEFAULT_MIRROR = 'https://mcstudio-cn.oss-cn-chengdu.aliyuncs.com/mc-command-studio/updates/'
const GITHUB_LATEST = 'https://github.com/JiangNanChina/mc-command-studio/releases/latest/download/'

function normalizeBase(raw) {
  return raw.endsWith('/') ? raw : `${raw}/`
}

function parseVersion(text) {
  const match = /^version:\s*(.+)$/m.exec(text)
  return match ? match[1].trim() : null
}

function parsePath(text) {
  const match = /^path:\s*(.+)$/m.exec(text)
  return match ? match[1].trim() : null
}

function compareVersions(a, b) {
  const pa = a.split('-')[0].split('.').map(Number)
  const pb = b.split('-')[0].split('.').map(Number)
  for (let index = 0; index < Math.max(pa.length, pb.length); index += 1) {
    const left = pa[index] ?? 0
    const right = pb[index] ?? 0
    if (left !== right) return left > right ? 1 : -1
  }
  return 0
}

async function readLatest(base) {
  const url = new URL('latest.yml', normalizeBase(base))
  const response = await fetch(url, { redirect: 'follow' })
  if (!response.ok) throw new Error(`${url.href} 返回 HTTP ${response.status}`)
  const text = await response.text()
  return {
    url: url.href,
    text,
    version: parseVersion(text),
    path: parsePath(text),
    cacheControl: response.headers.get('cache-control') ?? ''
  }
}

async function checkRange(base, filePath) {
  if (!filePath) return { ok: false, detail: 'latest.yml 里没有 path 字段' }
  const url = new URL(filePath, normalizeBase(base))
  const response = await fetch(url, { headers: { Range: 'bytes=0-0' } })
  const ok = response.status === 206
  await response.body?.cancel()
  return { ok, detail: `${response.status} ${url.href}` }
}

async function main() {
  const mirrorBase = normalizeBase(process.argv[2] ?? DEFAULT_MIRROR)
  const failures = []

  console.log(`镜像地址：${mirrorBase}`)

  let mirror
  try {
    mirror = await readLatest(mirrorBase)
  } catch (error) {
    console.error(`✗ 镜像不可用：${error.message}`)
    console.error('  先按 docs/21-cn-mirror-oss.md 建 Bucket 并跑一次 mirror.yml。')
    process.exit(1)
  }

  console.log(`✓ 镜像 latest.yml：HTTP 200，version=${mirror.version ?? '（无法解析）'}`)
  if (!mirror.version) failures.push('latest.yml 缺少 version 字段')
  if (!/no-cache|max-age=0/i.test(mirror.cacheControl)) {
    failures.push(`latest.yml 的 Cache-Control 是 "${mirror.cacheControl || '（未设置）'}"，应为 no-cache`)
  }

  let github = null
  try {
    github = await readLatest(GITHUB_LATEST)
    console.log(`✓ GitHub latest.yml：version=${github.version ?? '（无法解析）'}`)
  } catch (error) {
    console.warn(`! 取不到 GitHub latest.yml，跳过版本比对：${error.message}`)
  }

  if (github?.version && mirror.version) {
    const delta = compareVersions(mirror.version, github.version)
    if (delta === 0) console.log('✓ 版本一致')
    else if (delta < 0) failures.push(`镜像落后：镜像 ${mirror.version} < GitHub ${github.version}`)
    else console.log(`! 镜像版本 ${mirror.version} 高于 GitHub ${github.version}（可能刚落发布）`)
  }

  const range = await checkRange(mirrorBase, mirror.path)
  if (range.ok) console.log('✓ 安装包支持 Range（差异更新可用）')
  else failures.push(`安装包 Range 检查失败：${range.detail}`)

  if (failures.length > 0) {
    console.error('\n发现问题：')
    for (const item of failures) console.error(`  - ${item}`)
    process.exit(1)
  }
  console.log('\n镜像检查全部通过。')
}

await main()
