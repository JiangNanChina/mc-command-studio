#!/usr/bin/env node
// 一键发版 + 同步国内镜像：版本校验 → 类型检查/测试/构建 → 上传 OSS → 写 Secrets → 体检 →（可选）打 tag。
// 用法：node tools/release/release-oss.mjs [--publish] [--no-prompt] [--skip-build] [--skip-tests]
//                                        [--skip-mirror-check] [--bucket ...] [--endpoint ...]
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ask, askSecret, capture, run, runShell, which } from './oss-lib.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

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

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'))
}

/**
 * esbuild 会在 TEMP 里建临时目录再删掉；这台机器上 %TEMP% 的删除被拒（杀软/ACL）。
 * 把 TEMP 指到仓库内新建的空目录，保证目录归属清晰，失败后还能换一个目录重试。
 */
function buildWithTemp(name) {
  const tmpRoot = path.join(ROOT, '.tmp', name)
  try {
    rmSync(tmpRoot, { recursive: true, force: true })
  } catch {
    // 被占用就换新目录，不阻塞
  }
  mkdirSync(tmpRoot, { recursive: true })
  console.log(`  build temp: ${tmpRoot}`)
  return runShell('pnpm build:win', {
    env: { ...process.env, TMP: tmpRoot, TEMP: tmpRoot, TMPDIR: tmpRoot }
  })
}

async function main() {
  const flags = parseArgs(process.argv.slice(2))
  process.chdir(ROOT)

  // ---------- 0. 预检 ----------
  step('0/5 environment')
  for (const binary of ['pnpm', 'git']) {
    if (!which(binary)) fail(`${binary} not found in PATH`)
  }
  console.log(`repo: ${ROOT}`)

  // ---------- 1. 版本一致性 ----------
  step('1/5 version consistency')
  const version = readJson(path.join(ROOT, 'package.json')).version
  const appVersion = readJson(path.join(ROOT, 'apps/desktop/package.json')).version
  if (version !== appVersion) fail(`package.json is ${version} but apps/desktop is ${appVersion}`)

  const changelog = readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  const firstEntry = /^## \[([^\]]+)\]/m.exec(changelog)?.[1]
  if (firstEntry !== version) fail(`CHANGELOG top entry is ${firstEntry}, expected ${version}`)

  const announcement = readFileSync(path.join(ROOT, 'packages/content/src/changelog.ts'), 'utf8')
  const announcementVersion = /version:\s*'([^']+)'/.exec(announcement)?.[1]
  if (announcementVersion !== version) {
    fail(`in-app announcement is ${announcementVersion}, expected ${version}`)
  }
  console.log(`v${version}: package / CHANGELOG / in-app announcement all match`)

  // ---------- 2. 凭据 ----------
  step('2/5 credentials')
  const bucket = String(flags.bucket ?? process.env.OSS_BUCKET ?? 'mcstudio-cn').trim()
  const endpoint = String(flags.endpoint ?? process.env.OSS_ENDPOINT ?? 'oss-cn-chengdu.aliyuncs.com')
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')
  const prefix = String(flags.prefix ?? 'mc-command-studio/updates').replace(/^\/+|\/+$/g, '')

  let accessKeyId = (process.env.OSS_ACCESS_KEY_ID ?? '').trim()
  let accessKeySecret = (process.env.OSS_ACCESS_KEY_SECRET ?? '').trim()
  if (!accessKeyId) accessKeyId = await ask('AccessKey ID (RAM user): ')
  if (!accessKeySecret) accessKeySecret = await askSecret('AccessKey Secret (hidden): ')
  if (!accessKeyId || !accessKeySecret) fail('credentials are empty')
  console.log(`target: oss://${bucket}/${prefix} (${endpoint})`)

  // ---------- 3. 构建 ----------
  if (flags['skip-build']) {
    step('3/5 build (skipped)')
  } else {
    step('3/5 typecheck, test, build')
    if (runShell('pnpm typecheck') !== 0) fail('typecheck failed')

    if (flags['skip-tests']) {
      console.warn('WARN: unit tests skipped (--skip-tests)')
    } else if (runShell('pnpm test') !== 0) {
      fail('unit tests failed')
    }

    let buildStatus = buildWithTemp('build-1')
    if (buildStatus !== 0) {
      console.warn('WARN: build failed, retrying once with a clean temp dir ...')
      buildStatus = buildWithTemp('build-2')
    }
    if (buildStatus !== 0) {
      fail(
        'build:win failed twice. Close any running `pnpm dev` / Electron window, ' +
          'add an antivirus exclusion for this repo and %TEMP%, then retry.'
      )
    }
  }

  // ---------- 4. 校验产物 + 上传 ----------
  step('4/5 verify artifacts and upload')
  const latestPath = path.join(ROOT, 'release/latest.yml')
  if (!existsSync(latestPath)) fail('release/latest.yml not found; rerun without --skip-build')

  const latestVersion = /^version:\s*(.+)$/m.exec(readFileSync(latestPath, 'utf8'))?.[1]?.trim()
  if (latestVersion !== version) {
    fail(`release artifacts are ${latestVersion} but package.json is ${version}; rebuild first`)
  }

  const setupExe = path.join(ROOT, `release/MC-Command-Studio-Setup-${version}.exe`)
  if (!existsSync(setupExe)) fail(`missing MC-Command-Studio-Setup-${version}.exe`)

  const childArgs = [
    path.join(ROOT, 'tools/release/setup-oss.mjs'),
    '--bucket',
    bucket,
    '--endpoint',
    endpoint,
    '--prefix',
    prefix,
    '--release-dir',
    path.join(ROOT, 'release')
  ]
  if (flags['skip-mirror-check']) childArgs.push('--skip-verify')

  const child = spawnSync(process.execPath, childArgs, {
    stdio: 'inherit',
    env: { ...process.env, OSS_ACCESS_KEY_ID: accessKeyId, OSS_ACCESS_KEY_SECRET: accessKeySecret }
  })
  if (child.error) throw child.error
  if ((child.status ?? 1) !== 0) fail('OSS upload failed')

  // ---------- 5. 可选发布 ----------
  let publish = Boolean(flags.publish)
  if (!publish && !flags['no-prompt']) {
    const answer = (await ask(`Tag v${version} and push now? (y/N) `)).toLowerCase()
    publish = answer === 'y' || answer === 'yes'
  }

  if (publish) {
    step(`5/5 tag v${version}`)
    const status = capture('git', ['status', '--porcelain'])
    if (status.stdout) {
      console.warn('WARN: working tree has uncommitted changes; the tag will point at current HEAD:')
      console.warn(status.stdout)
    }

    const existing = capture('git', ['rev-parse', '-q', '--verify', `refs/tags/v${version}`])
    if (existing.status === 0) fail(`tag v${version} already exists`)

    if (run('git', ['tag', `v${version}`]) !== 0) fail('git tag failed')
    if (run('git', ['push', 'origin', 'main', '--tags']) !== 0) fail('git push failed')
    console.log('tag pushed. GitHub Actions will build a draft release; publish it and mirror.yml syncs the next versions.')
  } else {
    step('5/5 release (skipped)')
    console.log(`Artifacts and mirror are ready. To release later:`)
    console.log(`  git tag v${version} && git push origin main --tags`)
    console.log('or rerun with --publish')
  }

  console.log(`\nDone: v${version}`)
  console.log(`Mirror: https://${bucket}.${endpoint}/${prefix}/`)
  console.log('Clients try the mirror first and fall back to GitHub.')
}

main().catch((error) => {
  console.error(`\nERROR: ${error.message}`)
  process.exitCode = 1
})
