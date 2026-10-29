#!/usr/bin/env node
// 把 release/ 产物同步到阿里云 OSS 国内镜像：建桶、公共读、上传、设置缓存头、写 GitHub Secrets、体检。
// 用法：node tools/release/setup-oss.mjs [--bucket mcstudio-cn] [--endpoint oss-cn-chengdu.aliyuncs.com]
//                                      [--skip-secrets] [--skip-verify]
// 凭据从环境变量 OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET 读取，缺省时交互输入（Secret 不回显）。
import { createReadStream, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ask, askSecret, capture, ensureOssutil, fileSizeLabel, run, which } from './oss-lib.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const DEFAULT_BUCKET = 'mcstudio-cn'
const DEFAULT_ENDPOINT = 'oss-cn-chengdu.aliyuncs.com'
const DEFAULT_PREFIX = 'mc-command-studio/updates'

function parseArgs(argv) {
  const flags = {}
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith('--')) continue
    const key = token.slice(2)
    const next = argv[index + 1]
    if (next && !next.startsWith('--')) {
      flags[key] = next
      index += 1
    } else {
      flags[key] = true
    }
  }
  return flags
}

function step(title) {
  console.log(`\n== ${title}`)
}

function fail(message) {
  throw new Error(message)
}

function normalizeEndpoint(raw) {
  return String(raw).replace(/^https?:\/\//, '').replace(/\/+$/, '')
}

function normalizePrefix(raw) {
  return String(raw).replace(/^\/+|\/+$/g, '')
}

function sha256File(file) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    const stream = createReadStream(file)
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}

async function main() {
  const flags = parseArgs(process.argv.slice(2))

  const bucket = String(flags.bucket ?? process.env.OSS_BUCKET ?? DEFAULT_BUCKET).trim()
  const endpoint = normalizeEndpoint(flags.endpoint ?? process.env.OSS_ENDPOINT ?? DEFAULT_ENDPOINT)
  const prefix = normalizePrefix(flags.prefix ?? DEFAULT_PREFIX)
  const releaseDir = path.resolve(String(flags['release-dir'] ?? path.join(ROOT, 'release')))

  if (!bucket) fail('bucket is empty')
  if (!endpoint) fail('endpoint is empty')
  if (!prefix) fail('prefix is empty')
  if (!existsSync(releaseDir)) fail(`release dir not found: ${releaseDir}`)

  // ---------- 1. 凭据 ----------
  step('1/6 credentials')
  let accessKeyId = (process.env.OSS_ACCESS_KEY_ID ?? '').trim()
  let accessKeySecret = (process.env.OSS_ACCESS_KEY_SECRET ?? '').trim()
  if (!accessKeyId) accessKeyId = await ask('AccessKey ID (RAM user): ')
  if (!accessKeySecret) accessKeySecret = await askSecret('AccessKey Secret (hidden): ')
  if (!accessKeyId || !accessKeySecret) fail('credentials are empty')
  console.log(`bucket   : ${bucket}`)
  console.log(`endpoint : ${endpoint}`)
  console.log(`prefix   : ${prefix}`)

  const ossArgs = ['-e', endpoint, '-i', accessKeyId, '-k', accessKeySecret]
  const remote = `oss://${bucket}/${prefix}`
  const baseUrl = `https://${bucket}.${endpoint}/${prefix}/`

  // ---------- 2. ossutil ----------
  step('2/6 ossutil')
  const ossutil = await ensureOssutil(flags.ossutil ? String(flags.ossutil) : undefined)
  console.log(`ossutil: ${ossutil}`)

  // ---------- 3. bucket ----------
  step(`3/6 bucket oss://${bucket}`)
  // 注意：Bucket 已存在时，用 RAM 用户 AK 调 PutBucket 一定返回 BucketAlreadyExists，
  // 这是阿里云的既定行为（只有主账号能重复创建自己的 Bucket），不代表桶不是你的。
  const created = capture(ossutil, ['mb', `oss://${bucket}`, ...ossArgs])
  if (created.status === 0) {
    console.log('bucket created')
  } else if (/BucketAlreadyExists/i.test(`${created.stdout}\n${created.stderr}`)) {
    console.log('bucket already exists, skip creation')
  } else {
    const detail = `${created.stdout}\n${created.stderr}`.trim().slice(0, 300)
    console.warn(`WARN: PutBucket failed (${detail}), will try to use the bucket anyway`)
  }

  // ACL 失败不致命：桶可能本来就是公共读，或者 RAM 用户没有 PutBucketAcl。
  const acl = capture(ossutil, ['set-acl', `oss://${bucket}`, 'public-read', ...ossArgs])
  if (acl.status === 0) console.log('bucket ACL: public-read')
  else console.warn('WARN: could not set ACL (needs oss:PutBucketAcl). Already public-read? ignore this.')

  // ---------- 4. 产物 ----------
  step('4/6 upload')
  const latestPath = path.join(releaseDir, 'latest.yml')
  if (!existsSync(latestPath)) fail(`missing ${latestPath}; run pnpm build:win first`)

  const latestText = readFileSync(latestPath, 'utf8')
  const version = /^version:\s*(.+)$/m.exec(latestText)?.[1]?.trim()
  if (!version) fail('latest.yml has no version field')
  console.log(`latest.yml version: ${version}`)

  const setupExe = path.join(releaseDir, `MC-Command-Studio-Setup-${version}.exe`)
  if (!existsSync(setupExe)) {
    fail(`missing MC-Command-Studio-Setup-${version}.exe in ${releaseDir}`)
  }

  // 只传当前版本的安装包/便携版，外加所有 blockmap（差异更新要旧版本的块索引）。
  // 历史安装包留在 GitHub Release，不必占镜像流量。
  const currentExe = new Set([`MC-Command-Studio-Setup-${version}.exe`, `MC-Command-Studio-${version}-portable.exe`])
  const files = readdirSync(releaseDir)
    .filter((name) => currentExe.has(name) || /\.blockmap$/i.test(name))
    .map((name) => path.join(releaseDir, name))

  if (files.length === 0) fail(`no installers or blockmaps in ${releaseDir}`)
  for (const file of files) {
    console.log(`  upload ${path.basename(file)} (${fileSizeLabel(file)})`)
    const status = run(ossutil, ['cp', '-f', ...ossArgs, file, `${remote}/${path.basename(file)}`])
    if (status !== 0) {
      fail(
        `upload failed: ${path.basename(file)}\n` +
          `Check that this AccessKey belongs to the account owning "${bucket}" ` +
          `and that the RAM user has oss:PutObject on ${remote}/*`
      )
    }
  }

  // latest.yml 最后传，并禁用缓存
  console.log(`  upload latest.yml`)
  const latestStatus = run(ossutil, ['cp', '-f', ...ossArgs, latestPath, `${remote}/latest.yml`])
  if (latestStatus !== 0) fail('upload failed: latest.yml')

  const metaStatus = run(ossutil, [
    'set-meta',
    `${remote}/latest.yml`,
    'Cache-Control:no-cache#Content-Type:text/yaml',
    '-f',
    ...ossArgs
  ])
  if (metaStatus !== 0) {
    console.warn('WARN: failed to set Cache-Control on latest.yml, set it manually in the OSS console.')
  }

  // checksums.txt 现场生成：release/ 里那份往往是旧构建留下的，直接传会误导用户。
  const checksumLines = []
  for (const file of files) {
    checksumLines.push(`${await sha256File(file)}  ${path.basename(file)}`)
  }
  checksumLines.push(`${await sha256File(latestPath)}  latest.yml`)
  const checksumFile = path.join(os.tmpdir(), `mcstudio-checksums-${Date.now()}.txt`)
  writeFileSync(checksumFile, `${checksumLines.sort().join('\n')}\n`, 'utf8')
  console.log('  upload checksums.txt (regenerated)')
  const checksumStatus = run(ossutil, ['cp', '-f', ...ossArgs, checksumFile, `${remote}/checksums.txt`])
  if (checksumStatus !== 0) console.warn('WARN: failed to upload checksums.txt (optional)')

  // ---------- 5. 地址 ----------
  step('5/6 mirror url')
  console.log(`update feed: ${baseUrl}`)
  console.log(`latest.yml : ${baseUrl}latest.yml`)
  console.log('')
  console.log('DEFAULT_MIRROR_URL lives in apps/desktop/src/main/updateFeeds.ts.')
  console.log('If you changed bucket/prefix, update that constant and docs/21-cn-mirror-oss.md.')

  // ---------- 6. secrets + verify ----------
  if (!flags['skip-secrets']) {
    step('6/6 GitHub secrets')
    const gh = which('gh')
    if (!gh) {
      console.warn('WARN: gh CLI not found, skip. Configure the 4 secrets manually in repo settings.')
    } else {
      const secrets = [
        ['OSS_BUCKET', bucket],
        ['OSS_ENDPOINT', endpoint],
        ['OSS_ACCESS_KEY_ID', accessKeyId],
        ['OSS_ACCESS_KEY_SECRET', accessKeySecret]
      ]
      let written = 0
      for (const [name, value] of secrets) {
        const status = run(gh, ['secret', 'set', name, '--body', value], { cwd: ROOT })
        if (status !== 0) {
          console.warn(`WARN: gh secret set ${name} failed (need gh auth + repo admin). Set it manually.`)
          break
        }
        written += 1
      }
      if (written === secrets.length) console.log('4 secrets written to GitHub repository')
    }
  }

  if (!flags['skip-verify']) {
    step('verify mirror')
    const status = run(process.execPath, [path.join(ROOT, 'tools/release/check-mirror.mjs'), baseUrl])
    if (status !== 0) {
      console.warn('WARN: mirror check did not pass. If the mirror is simply older than GitHub, wait for the next release.')
    }
  }

  console.log('\nDone.')
}

main().catch((error) => {
  console.error(`\nERROR: ${error.message}`)
  process.exitCode = 1
})
