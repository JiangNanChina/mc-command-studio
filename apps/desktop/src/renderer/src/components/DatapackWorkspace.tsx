import { useMemo, useState } from 'react'
import {
  FileArchive,
  FileCode2,
  FileJson,
  FolderTree,
  PackageOpen,
  Plus,
  Save,
  Trash2
} from 'lucide-react'
import { buildDatapackFiles, datapackDataFolder, usesModernDatapackFolders } from '../../../shared/datapack'
import { getApi } from '../lib/api'
import { useAppStore, type DatapackDataFileDraft } from '../store'
import { LootTableEditor } from './LootTableEditor'
import { AdvancementEditor } from './AdvancementEditor'
import { PredicateEditor } from './PredicateEditor'

export function DatapackWorkspace() {
  const state = useAppStore()
  const datapack = state.datapack
  const packFormat = state.pack?.manifest.packFormat ?? 121
  const [exporting, setExporting] = useState(false)

  const active =
    datapack.functions.find((item) => item.id === datapack.activeFunctionId) ??
    datapack.functions[0]
  const activeData =
    datapack.dataFiles.find((item) => item.id === datapack.activeDataFileId) ??
    datapack.dataFiles[0]

  const preview = useMemo(() => {
    try {
      return {
        result: buildDatapackFiles({
          namespace: datapack.namespace,
          description: datapack.description,
          packFormat,
          functions: datapack.functions.map((item) => ({
            name: item.name,
            commands: item.commands
          })),
          loadFunction: datapack.loadFunction,
          tickFunction: datapack.tickFunction,
          files: datapack.dataFiles.map((item) => ({
            type: item.type,
            name: item.name,
            content: item.content
          }))
        }),
        error: null as string | null
      }
    } catch (error) {
      return {
        result: null,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }, [datapack, packFormat])

  const exportPack = async (): Promise<void> => {
    if (!preview.result) return
    setExporting(true)
    try {
      const result = await getApi().datapack.export({
        namespace: datapack.namespace,
        description: datapack.description,
        packFormat,
        functions: datapack.functions.map((item) => ({
          name: item.name,
          commands: item.commands
        })),
        loadFunction: datapack.loadFunction,
        tickFunction: datapack.tickFunction,
        files: datapack.dataFiles.map((item) => ({
          type: item.type,
          name: item.name,
          content: item.content
        }))
      })
      if (!result) return
      state.showToast(`数据包已导出：${result.path}`, 'success')
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
    <div className="content datapack-workspace">
      <div className="page-head">
        <div>
          <div className="crumb">工具 / 数据包工作区</div>
          <div className="hero">
            <div className="hero-icon">
              <PackageOpen size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                数据包工作区
                <span className="hero-id">datapack</span>
              </h1>
              <p className="hero-sub">
                独立于命令编辑：管理多个函数、load/tick 标签，并导出可直接放进
                <code className="code-inline">datapacks/</code> 的 zip。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <FolderTree size={15} />
            数据包信息
          </div>
          <div className="card-hint">pack_format {packFormat}</div>
        </div>
        <div className="card-body">
          <div className="grid-2">
            <div className="field">
              <label className="field-label" htmlFor="datapack-namespace">
                命名空间
              </label>
              <input
                id="datapack-namespace"
                className="input"
                value={datapack.namespace}
                spellCheck={false}
                onChange={(event) => state.updateDatapackMeta({ namespace: event.target.value })}
              />
              <div className="hint">小写字母、数字、下划线、点、连字符。</div>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="datapack-description">
                描述
              </label>
              <input
                id="datapack-description"
                className="input"
                value={datapack.description}
                onChange={(event) => state.updateDatapackMeta({ description: event.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="datapack-layout">
        <div className="card datapack-functions">
          <div className="card-head">
            <div className="card-title">
              <FileCode2 size={15} />
              函数
              <span className="badge">{datapack.functions.length}</span>
            </div>
            <button
              type="button"
              className="btn btn-sm"
              disabled={datapack.functions.length >= 64}
              onClick={() => state.addDatapackFunction()}
            >
              <Plus size={13} />
              新建
            </button>
          </div>
          <div className="card-body function-list">
            {datapack.functions.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`function-item${item.id === active?.id ? ' active' : ''}`}
                onClick={() => state.selectDatapackFunction(item.id)}
              >
                <span className="function-name">{item.name || '未命名'}</span>
                <span className="function-meta">
                  {item.commands.split('\n').filter((line) => line.trim()).length} 行
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">函数编辑器</div>
            <button
              type="button"
              className="btn btn-sm"
              disabled={datapack.functions.length <= 1}
              onClick={() => {
                if (active) state.removeDatapackFunction(active.id)
              }}
            >
              <Trash2 size={13} />
              删除
            </button>
          </div>
          {active ? (
            <div className="card-body">
              <div className="field">
                <label className="field-label" htmlFor="datapack-function-name">
                  函数名
                </label>
                <input
                  id="datapack-function-name"
                  className="input"
                  value={active.name}
                  spellCheck={false}
                  onChange={(event) =>
                    state.updateDatapackFunction(active.id, { name: event.target.value })
                  }
                />
                <div className="hint">可带子目录，例如 lib/main。</div>
              </div>
              <div className="field" style={{ marginTop: 12 }}>
                <label className="field-label" htmlFor="datapack-commands">
                  命令（每行一条）
                </label>
                <textarea
                  id="datapack-commands"
                  className="textarea datapack-command-input"
                  value={active.commands}
                  spellCheck={false}
                  placeholder="say 你好&#10;give @s minecraft:stone"
                  onChange={(event) =>
                    state.updateDatapackFunction(active.id, { commands: event.target.value })
                  }
                />
              </div>

              <div className="grid-2" style={{ marginTop: 12 }}>
                <div className="field">
                  <label className="field-label" htmlFor="datapack-load">
                    加载时运行（load）
                  </label>
                  <select
                    id="datapack-load"
                    className="select"
                    value={datapack.loadFunction}
                    onChange={(event) => state.setDatapackLoadFunction(event.target.value)}
                  >
                    <option value="">不设置</option>
                    {datapack.functions.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="datapack-tick">
                    每刻运行（tick）
                  </label>
                  <select
                    id="datapack-tick"
                    className="select"
                    value={datapack.tickFunction}
                    onChange={(event) => state.setDatapackTickFunction(event.target.value)}
                  >
                    <option value="">不设置</option>
                    {datapack.functions.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="hint" style={{ marginTop: 8 }}>
                每行一条命令，前导 / 可省略；函数名、命名空间和标签会在导出前校验。
                当前版本导出目录：
                <code className="code-inline">
                  data/{datapack.namespace}/{usesModernDatapackFolders(packFormat) ? 'function' : 'functions'}/
                </code>。
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <FileJson size={15} />
            高级数据文件
            <span className="badge">{datapack.dataFiles.length}</span>
          </div>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => state.addDatapackDataFile('predicate')}
            >
              <Plus size={13} />
              谓词
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => state.addDatapackDataFile('advancement')}
            >
              <Plus size={13} />
              进度
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => state.addDatapackDataFile('loot_table')}
            >
              <Plus size={13} />
              战利品表
            </button>
          </div>
        </div>
        <div className="card-body">
          {datapack.dataFiles.length === 0 ? (
            <div className="hint">
              可选：添加谓词、进度或战利品表 JSON；导出时会写入 data/&lt;namespace&gt;/ 对应目录。
            </div>
          ) : (
            <>
              <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                {datapack.dataFiles.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`chip${item.id === activeData?.id ? ' active' : ''}`}
                    onClick={() => state.selectDatapackDataFile(item.id)}
                  >
                    {item.type === 'advancement'
                      ? '进度'
                      : item.type === 'predicate'
                        ? '谓词'
                        : '战利品表'}
                    {' · '}
                    {item.name}
                  </button>
                ))}
              </div>

              {activeData ? (
                <div style={{ marginTop: 12 }}>
                  <div className="grid-2">
                    <div className="field">
                      <label className="field-label" htmlFor="datapack-data-type">
                        类型
                      </label>
                      <select
                        id="datapack-data-type"
                        className="select"
                        value={activeData.type}
                        onChange={(event) =>
                          state.updateDatapackDataFile(activeData.id, {
                            type: event.target.value as DatapackDataFileDraft['type']
                          })
                        }
                      >
                        <option value="predicate">谓词 Predicate</option>
                        <option value="advancement">进度 Advancement</option>
                        <option value="loot_table">战利品表 Loot table</option>
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="datapack-data-name">
                        文件名
                      </label>
                      <input
                        id="datapack-data-name"
                        className="input"
                        value={activeData.name}
                        spellCheck={false}
                        onChange={(event) =>
                          state.updateDatapackDataFile(activeData.id, {
                            name: event.target.value
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="field" style={{ marginTop: 10 }}>
                    <label className="field-label" htmlFor="datapack-data-content">
                      JSON 内容
                    </label>
                    <textarea
                      id="datapack-data-content"
                      className="textarea datapack-command-input"
                      value={activeData.content}
                      spellCheck={false}
                      onChange={(event) =>
                        state.updateDatapackDataFile(activeData.id, {
                          content: event.target.value
                        })
                      }
                    />
                  </div>
                  {activeData.type === 'loot_table' ? (
                    <LootTableEditor
                      content={activeData.content}
                      onChange={(content) =>
                        state.updateDatapackDataFile(activeData.id, { content })
                      }
                    />
                  ) : null}
                  {activeData.type === 'advancement' ? (
                    <AdvancementEditor
                      content={activeData.content}
                      onChange={(content) =>
                        state.updateDatapackDataFile(activeData.id, { content })
                      }
                    />
                  ) : null}
                  {activeData.type === 'predicate' ? (
                    <PredicateEditor
                      content={activeData.content}
                      onChange={(content) =>
                        state.updateDatapackDataFile(activeData.id, { content })
                      }
                    />
                  ) : null}
                  <div className="row" style={{ marginTop: 8, justifyContent: 'space-between' }}>
                    <div className="hint">
                      data/{datapack.namespace}/
                      {datapackDataFolder(packFormat, activeData.type)}/
                      {activeData.name || 'file'}.json
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => state.removeDatapackDataFile(activeData.id)}
                    >
                      <Trash2 size={13} />
                      删除文件
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <FileArchive size={15} />
            导出
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!preview.result || exporting}
            onClick={() => void exportPack()}
          >
            <Save size={14} />
            {exporting ? '导出中…' : '导出数据包 .zip'}
          </button>
        </div>
        <div className="card-body">
          {preview.error ? (
            <div className="diag error" style={{ marginBottom: 10 }}>
              {preview.error}
            </div>
          ) : null}
          <div className="datapack-files">
            {(preview.result?.files ?? []).map((file) => (
              <div className="datapack-file" key={file.path}>
                <FileArchive size={13} />
                {file.path}
              </div>
            ))}
          </div>
          <div className="hint" style={{ marginTop: 8 }}>
            导出后放入世界 <code className="code-inline">datapacks/</code>，执行{' '}
            <code className="code-inline">/reload</code>；函数可通过{' '}
            <code className="code-inline">/function {datapack.namespace}:函数名</code> 运行。
          </div>
        </div>
      </div>
    </div>
  )
}
