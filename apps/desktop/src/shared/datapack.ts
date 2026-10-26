export interface DatapackFunctionInput {
  name: string
  commands: string
}

export type DatapackDataFileType = 'advancement' | 'predicate' | 'loot_table'

export interface DatapackDataFileInput {
  type: DatapackDataFileType
  name: string
  content: string
}

export interface DatapackExportOptions {
  namespace: string
  description: string
  packFormat: number
  functions: DatapackFunctionInput[]
  loadFunction: string
  tickFunction: string
  files?: DatapackDataFileInput[]
}

export interface DatapackFile {
  path: string
  content: string
}

export interface DatapackBuildResult {
  files: DatapackFile[]
  functionIds: string[]
}

const NAMESPACE = /^[a-z0-9_.-]+$/
const FUNCTION = /^[a-z0-9_.-]+(?:\/[a-z0-9_.-]+)*$/ // 允许子目录，禁止空段
const DATA_FILE = /^[a-z0-9_.-]+(?:\/[a-z0-9_.-]+)*$/
const DATA_FOLDER: Record<DatapackDataFileType, string> = {
  advancement: 'advancement',
  predicate: 'predicate',
  loot_table: 'loot_table'
}

function normalizeCommands(source: string): string {
  const lines = source
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim().replace(/^\/+/, ''))
    .filter((line) => line.length > 0)
  return lines.length > 0 ? `${lines.join('\n')}\n` : ''
}

export function buildDatapackFiles(options: DatapackExportOptions): DatapackBuildResult {
  const namespace = options.namespace.trim()
  const description = options.description.trim() || 'MC 指令工坊导出'

  if (!NAMESPACE.test(namespace)) {
    throw new Error('命名空间只能包含小写字母、数字、下划线、点和连字符')
  }
  if (!Number.isInteger(options.packFormat) || options.packFormat <= 0) {
    throw new Error('数据包格式版本不合法')
  }
  if (options.functions.length === 0) {
    throw new Error('至少需要一个函数')
  }
  if (options.functions.length > 64) {
    throw new Error('单个数据包最多 64 个函数')
  }

  const functions = options.functions.map((item) => {
    const name = item.name.trim().replace(/\.mcfunction$/i, '')
    if (!FUNCTION.test(name)) {
      throw new Error(`函数名不合法：${item.name || '(空)'}`)
    }
    return { name, content: normalizeCommands(item.commands) }
  })

  const names = functions.map((item) => item.name)
  if (new Set(names).size !== names.length) {
    throw new Error('函数名不能重复')
  }

  const functionId = (name: string): string => `${namespace}:${name}`
  const files: DatapackFile[] = [
    {
      path: 'pack.mcmeta',
      content: `${JSON.stringify(
        {
          pack: {
            pack_format: options.packFormat,
            description
          }
        },
        null,
        2
      )}\n`
    },
    ...functions.map((item) => ({
      path: `data/${namespace}/function/${item.name}.mcfunction`,
      content: item.content
    }))
  ]

  const loadFunction = options.loadFunction.trim()
  if (loadFunction) {
    if (!names.includes(loadFunction)) throw new Error('load 函数不存在')
    files.push({
      path: 'data/minecraft/tags/function/load.json',
      content: `${JSON.stringify({ values: [functionId(loadFunction)] }, null, 2)}\n`
    })
  }
  const tickFunction = options.tickFunction.trim()
  if (tickFunction) {
    if (!names.includes(tickFunction)) throw new Error('tick 函数不存在')
    files.push({
      path: 'data/minecraft/tags/function/tick.json',
      content: `${JSON.stringify({ values: [functionId(tickFunction)] }, null, 2)}\n`
    })
  }

  const dataFiles = options.files ?? []
  if (dataFiles.length > 128) throw new Error('高级数据文件最多 128 个')
  const dataPaths = new Set<string>()
  for (const file of dataFiles) {
    const name = file.name.trim().replace(/\.json$/i, '')
    if (!DATA_FILE.test(name)) throw new Error(`数据文件名不合法：${file.name || '(空)'}`)
    const path = `data/${namespace}/${DATA_FOLDER[file.type]}/${name}.json`
    if (dataPaths.has(path)) throw new Error(`数据文件重复：${path}`)
    dataPaths.add(path)
    let parsed: unknown
    try {
      parsed = JSON.parse(file.content)
    } catch {
      throw new Error(`JSON 格式错误：${path}`)
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error(`JSON 根节点必须是对象：${path}`)
    }
    files.push({ path, content: `${JSON.stringify(parsed, null, 2)}\n` })
  }

  return { files, functionIds: functions.map((item) => functionId(item.name)) }
}
