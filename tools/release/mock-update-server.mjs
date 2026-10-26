#!/usr/bin/env node
/**
 * 本地更新源：把一个目录（含 latest.yml + 安装包）以 /updates/ 暴露出来。
 * 用法：node tools/release/mock-update-server.mjs [directory] [port]
 * 默认目录：release/update-feed，端口 8123。
 */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
const directory = resolve(process.argv[2] ?? join(ROOT, 'release/update-feed'))
const port = Number(process.argv[3] ?? 8123)

const MIME = {
  '.yml': 'text/yaml; charset=utf-8',
  '.yaml': 'text/yaml; charset=utf-8',
  '.exe': 'application/octet-stream',
  '.blockmap': 'application/octet-stream',
  '.json': 'application/json; charset=utf-8'
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://127.0.0.1:${port}`)
    if (!url.pathname.startsWith('/updates/')) {
      response.writeHead(404)
      response.end('not found')
      return
    }
    const relative = decodeURIComponent(url.pathname.slice('/updates/'.length))
    const filePath = normalize(join(directory, relative))
    if (!filePath.startsWith(directory)) {
      response.writeHead(403)
      response.end('forbidden')
      return
    }
    const info = await stat(filePath)
    if (!info.isFile()) throw new Error('not a file')
    const data = await readFile(filePath)
    response.writeHead(200, {
      'content-type': MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
      'content-length': data.length,
      'cache-control': 'no-cache'
    })
    response.end(data)
  } catch {
    response.writeHead(404)
    response.end('not found')
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`更新源已启动：http://127.0.0.1:${port}/updates/`)
  console.log(`目录：${directory}`)
  console.log('把 MCSTUDIO_UPDATE_URL 设为上面的 URL 即可让安装版走本地更新。')
})
