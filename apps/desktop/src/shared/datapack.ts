export interface DatapackExportOptions {
  command: string
  namespace: string
  functionName: string
  description: string
  packFormat: number
  load: boolean
  tick: boolean
}

export interface DatapackFile {
  path: string
  content: string
}

export interface DatapackBuildResult {
  files: DatapackFile[]
  functionId: string
}

const NAMESPACE = /^[a-z0-9_.-]+$/
const FUNCTION = /^[a-z0-9_.-]+(?:\/[a-z0-9_.-]+)*$/ // 允许子目录，禁止空段

export function buildDatapackFiles(options: DatapackExportOptions): DatapackBuildResult {
  const namespace = options.namespace.trim()
  const functionName = options.functionName.trim().replace(/\.mcfunction$/i, '')
  const description = options.description.trim() || 'MC 指令工坊导出'
  const command = options.command.trim().replace(/^\//, '')

  if (!NAMESPACE.test(namespace)) {
    throw new Error('命名空间只能包含小写字母、数字、下划线、点和连字符')
  }
  if (!FUNCTION.test(functionName)) {
    throw new Error('函数名只能包含小写字母、数字、下划线、点、连字符和 /')
  }
  if (!command) {
    throw new Error('当前没有可导出的命令')
  }
  if (/[\r\n]/.test(command)) {
    throw new Error('命令中不能包含换行符')
  }
  if (!Number.isInteger(options.packFormat) || options.packFormat <= 0) {
    throw new Error('数据包格式版本不合法')
  }

  const functionId = `${namespace}:${functionName}`
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
    {
      path: `data/${namespace}/function/${functionName}.mcfunction`,
      content: `${command}\n`
    }
  ]

  if (options.load) {
    files.push({
      path: 'data/minecraft/tags/function/load.json',
      content: `${JSON.stringify({ values: [functionId] }, null, 2)}\n`
    })
  }
  if (options.tick) {
    files.push({
      path: 'data/minecraft/tags/function/tick.json',
      content: `${JSON.stringify({ values: [functionId] }, null, 2)}\n`
    })
  }

  return { files, functionId }
}
