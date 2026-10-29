// OSS 发布脚本的公共工具：命令执行、凭据输入、ossutil 准备。
// 只用 Node 内置模块，不引入依赖；console 输出用英文，避免 Windows 控制台代码页把中文打成乱码。
import { spawnSync } from 'node:child_process'
import { createWriteStream, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import https from 'node:https'
import readline from 'node:readline/promises'

export const OSSUTIL_URL =
  'https://gosspublic.alicdn.com/ossutil/1.7.19/ossutil-v1.7.19-windows-amd64.zip'

export function run(command, args = [], options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options })
  if (result.error) throw result.error
  return result.status ?? 1
}

export function runShell(command, options = {}) {
  return run(command, [], { shell: true, ...options })
}

export function capture(command, args = []) {
  const result = spawnSync(command, args, { encoding: 'utf8' })
  if (result.error) throw result.error
  return {
    status: result.status ?? 1,
    stdout: (result.stdout ?? '').trim(),
    stderr: (result.stderr ?? '').trim()
  }
}

/** 在 PATH 里找可执行文件。 */
export function which(binary) {
  const exts = process.platform === 'win32' ? ['.exe', '.cmd', '.bat', ''] : ['']
  for (const dir of (process.env.PATH ?? '').split(path.delimiter)) {
    if (!dir) continue
    for (const ext of exts) {
      const candidate = path.join(dir, `${binary}${ext}`)
      if (existsSync(candidate)) return candidate
    }
  }
  return null
}

export function findFilesRecursive(dir, predicate, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) findFilesRecursive(full, predicate, out)
    else if (predicate(entry.name)) out.push(full)
  }
  return out
}

export async function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  try {
    return (await rl.question(question)).trim()
  } finally {
    rl.close()
  }
}

/** 隐藏输入（逐字符读，回显 *）。非 TTY 时退化为普通读取。 */
export async function askSecret(question) {
  if (!process.stdin.isTTY) return ask(question)

  return new Promise((resolve, reject) => {
    const stdin = process.stdin
    process.stderr.write(question)
    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('utf8')
    let value = ''

    const cleanup = () => {
      stdin.setRawMode(false)
      stdin.pause()
      stdin.removeListener('data', onData)
      process.stderr.write('\n')
    }

    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === '\u0003') {
          cleanup()
          process.stderr.write('^C\n')
          reject(new Error('cancelled'))
          return
        }
        if (char === '\r' || char === '\n') {
          cleanup()
          resolve(value)
          return
        }
        if (char === '\u007f' || char === '\b') {
          if (value.length > 0) {
            value = value.slice(0, -1)
            process.stderr.write('\b \b')
          }
          continue
        }
        if (char >= ' ') {
          value += char
          process.stderr.write('*')
        }
      }
    }

    stdin.on('data', onData)
  })
}

function downloadFile(url, destination, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) {
      reject(new Error('too many redirects'))
      return
    }
    const request = https.get(url, (response) => {
      const status = response.statusCode ?? 0
      if (status >= 300 && status < 400 && response.headers.location) {
        response.resume()
        resolve(downloadFile(response.headers.location, destination, redirects + 1))
        return
      }
      if (status !== 200) {
        response.resume()
        reject(new Error(`download failed: HTTP ${status}`))
        return
      }
      const file = createWriteStream(destination)
      response.pipe(file)
      file.on('finish', () => file.close(() => resolve()))
      file.on('error', reject)
    })
    request.on('error', reject)
  })
}

function extractZip(zip, dir) {
  const tar = spawnSync('tar', ['-xf', zip, '-C', dir], { stdio: 'ignore' })
  if (tar.status === 0) return
  const quote = (value) => `'${value.replace(/'/g, "''")}'`
  const command = `Expand-Archive -LiteralPath ${quote(zip)} -DestinationPath ${quote(dir)} -Force`
  const ps = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', command], {
    stdio: 'inherit'
  })
  if (ps.status !== 0) throw new Error('failed to extract ossutil archive')
}

export async function ensureOssutil(explicitPath) {
  if (explicitPath) {
    if (!existsSync(explicitPath)) throw new Error(`ossutil not found: ${explicitPath}`)
    return explicitPath
  }

  const fromPath = which('ossutil') ?? which('ossutil64')
  if (fromPath) return fromPath

  const cacheDir = path.join(process.env.LOCALAPPDATA ?? os.tmpdir(), 'mcstudio', 'tools', 'ossutil')
  const existing = findFilesRecursive(cacheDir, (name) => /^ossutil.*\.exe$/i.test(name))[0]
  if (existing) return existing

  console.log('ossutil not found, downloading 1.7.19 ...')
  mkdirSync(cacheDir, { recursive: true })
  const zip = path.join(cacheDir, 'ossutil.zip')
  await downloadFile(OSSUTIL_URL, zip)
  extractZip(zip, cacheDir)

  const found = findFilesRecursive(cacheDir, (name) => /^ossutil.*\.exe$/i.test(name))[0]
  if (!found) throw new Error('ossutil executable not found after extraction')
  return found
}

export function fileSizeLabel(file) {
  const bytes = statSync(file).size
  return `${(bytes / 1024 / 1024).toFixed(1)} MiB`
}
