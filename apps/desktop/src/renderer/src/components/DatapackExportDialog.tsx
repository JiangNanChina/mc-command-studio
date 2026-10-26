import { useState } from 'react'
import { FileArchive, PackagePlus } from 'lucide-react'
import { getApi } from '../lib/api'
import { Modal } from './Modal'
import { useAppStore } from '../store'

interface DatapackExportDialogProps {
  command: string
  packFormat: number
  onClose: () => void
}

export function DatapackExportDialog({ command, packFormat, onClose }: DatapackExportDialogProps) {
  const state = useAppStore()
  const [namespace, setNamespace] = useState('mcstudio')
  const [functionName, setFunctionName] = useState('main')
  const [description, setDescription] = useState('MC 指令工坊导出')
  const [load, setLoad] = useState(false)
  const [tick, setTick] = useState(false)
  const [exporting, setExporting] = useState(false)

  const functionPath = `data/${namespace}/function/${functionName}.mcfunction`

  const exportPack = async (): Promise<void> => {
    setExporting(true)
    try {
      const result = await getApi().datapack.export({
        command,
        namespace,
        functionName,
        description,
        packFormat,
        load,
        tick
      })
      if (!result) return
      state.showToast(`数据包已导出：${result.functionId}`, 'success')
      onClose()
    } catch (error) {
      state.showToast(
        `导出失败：${error instanceof Error ? error.message : String(error)}`,
        'error'
      )
    } finally {
      setExporting(false)
    }
  }

  return (
    <Modal
      title="导出数据包"
      subtitle="把当前命令打包成可直接放进 datapacks/ 的 .zip。"
      icon={<FileArchive size={17} />}
      onClose={onClose}
      wide
      footer={
        <>
          <div className="left">pack_format {packFormat || '未知'}</div>
          <button type="button" className="btn" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={exporting || !command.trim() || !packFormat}
            onClick={() => void exportPack()}
          >
            <PackagePlus size={14} />
            {exporting ? '导出中…' : '导出 .zip'}
          </button>
        </>
      }
    >
      <div className="grid-2">
        <div className="field">
          <label className="field-label" htmlFor="datapack-namespace">
            命名空间
          </label>
          <input
            id="datapack-namespace"
            className="input"
            value={namespace}
            spellCheck={false}
            onChange={(event) => setNamespace(event.target.value)}
          />
          <div className="hint">小写字母、数字、下划线、点、连字符。</div>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="datapack-function">
            函数名
          </label>
          <input
            id="datapack-function"
            className="input"
            value={functionName}
            spellCheck={false}
            onChange={(event) => setFunctionName(event.target.value)}
          />
          <div className="hint">可带子目录，例如 lib/main。</div>
        </div>
      </div>

      <div className="field" style={{ marginTop: 12 }}>
        <label className="field-label" htmlFor="datapack-description">
          数据包描述
        </label>
        <input
          id="datapack-description"
          className="input"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div className="row wrap" style={{ marginTop: 12, gap: 18 }}>
        <label className="checkline">
          <input type="checkbox" checked={load} onChange={(event) => setLoad(event.target.checked)} />
          写入 minecraft:load（加载时执行）
        </label>
        <label className="checkline">
          <input type="checkbox" checked={tick} onChange={(event) => setTick(event.target.checked)} />
          写入 minecraft:tick（每刻执行）
        </label>
      </div>

      <div className="divider" />

      <div className="section-label">将写入以下文件</div>
      <div className="datapack-files">
        <div className="datapack-file">
          <FileArchive size={13} />
          pack.mcmeta
        </div>
        <div className="datapack-file">
          <FileArchive size={13} />
          {functionPath}
        </div>
        {load ? (
          <div className="datapack-file">
            <FileArchive size={13} />
            data/minecraft/tags/function/load.json
          </div>
        ) : null}
        {tick ? (
          <div className="datapack-file">
            <FileArchive size={13} />
            data/minecraft/tags/function/tick.json
          </div>
        ) : null}
      </div>

      <div className="field" style={{ marginTop: 14 }}>
        <label className="field-label">函数内容</label>
        <pre className="datapack-command">{command.replace(/^\//, '')}</pre>
      </div>

      <div className="hint" style={{ marginTop: 10 }}>
        导出后把 zip 放进世界的 <code className="code-inline">datapacks/</code> 目录，游戏内执行{' '}
        <code className="code-inline">/reload</code>，再用{' '}
        <code className="code-inline">/function {namespace}:{functionName}</code> 运行。
      </div>
    </Modal>
  )
}
