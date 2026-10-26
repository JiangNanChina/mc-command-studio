import { useState } from 'react'
import { ClipboardPaste, FileSearch } from 'lucide-react'
import { parseGiveCommand, type ParseGiveResult } from '@mcstudio/core'
import { Modal } from './Modal'
import { useAppStore } from '../store'

const SAMPLE =
  '/give @s minecraft:diamond_sword[custom_name={text:"Excalibur",color:"gold",italic:false},lore=[{text:"A legendary blade.",color:"gray",italic:false}],enchantments={sharpness:5,unbreaking:3}] 1'

export function GiveImportDialog({ onClose }: { onClose: () => void }) {
  const state = useAppStore()
  const [text, setText] = useState('')
  const [result, setResult] = useState<ParseGiveResult | null>(null)

  const parse = (): void => {
    setResult(parseGiveCommand(text))
  }

  const apply = (): void => {
    if (!result?.ok) return
    state.applyGiveImport(result.options)
    state.showToast('命令已导入到 give 表单', 'success')
    onClose()
  }

  return (
    <Modal
      title="从命令导入"
      subtitle="粘贴一条 /give 命令，尽量还原成可编辑的表单；无法识别的组件会保留为 raw。"
      icon={<ClipboardPaste size={17} />}
      onClose={onClose}
      wide
      footer={
        <>
          <div className="left">
            {result ? (result.ok ? '解析成功' : '存在错误，请修正命令') : '支持带选择器、组件与数量的 /give'}
          </div>
          <button type="button" className="btn" onClick={onClose}>
            取消
          </button>
          <button type="button" className="btn" onClick={parse}>
            <FileSearch size={14} />
            解析
          </button>
          <button type="button" className="btn btn-primary" disabled={!result?.ok} onClick={apply}>
            应用到表单
          </button>
        </>
      }
    >
      <div className="field">
        <label className="field-label" htmlFor="give-import-text">
          命令
        </label>
        <textarea
          id="give-import-text"
          className="textarea"
          style={{ minHeight: 140 }}
          placeholder="/give @s minecraft:diamond_sword[custom_name={text:&quot;Excalibur&quot;}]"
          value={text}
          spellCheck={false}
          onChange={(event) => {
            setText(event.target.value)
            setResult(null)
          }}
        />
      </div>

      <div className="row" style={{ marginTop: 10 }}>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => {
            setText(SAMPLE)
            setResult(null)
          }}
        >
          填入示例
        </button>
        <span className="hint">支持的组件：名称、描述、附魔、无法破坏、耐久、稀有度、自定义数据等。</span>
      </div>

      {result ? (
        <div style={{ marginTop: 14 }}>
          <div className={`diag ${result.ok ? 'info' : 'error'}`}>
            {result.ok ? '已解析为表单，可以继续编辑后复制。' : '解析失败，请根据下面的提示修改。'}
          </div>
          {result.diagnostics.length > 0 ? (
            <div className="diagnostics" style={{ marginTop: 8 }}>
              {result.diagnostics.map((diagnostic, index) => (
                <div key={index} className={`diag ${diagnostic.severity}`}>
                  {diagnostic.message}
                </div>
              ))}
            </div>
          ) : null}
          {result.ok ? (
            <div className="output-note" style={{ marginTop: 10 }}>
              目标：<code className="code-inline">{result.options.target.base}</code> · 物品：
              <code className="code-inline">{result.options.item.id}</code> · 组件：
              {result.options.item.components.length} 个 · 数量：{result.options.count}
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  )
}
