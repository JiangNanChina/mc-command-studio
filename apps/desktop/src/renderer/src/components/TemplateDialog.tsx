import { useState } from 'react'
import { LayoutTemplate, Sparkles } from 'lucide-react'
import { Modal } from './Modal'
import { COMMAND_TEMPLATES, type CommandTemplate } from '../lib/templates'
import { useAppStore } from '../store'

export function TemplateDialog({ onClose }: { onClose: () => void }) {
  const [busy, setBusy] = useState(false)
  const apply = async (template: CommandTemplate): Promise<void> => {
    if (busy) return
    setBusy(true)
    try {
      await template.apply()
      useAppStore.getState().showToast(`已应用模板：${template.title}`, 'success')
      onClose()
    } catch (error) {
      useAppStore
        .getState()
        .showToast(`模板应用失败：${error instanceof Error ? error.message : String(error)}`, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      title="模板库"
      subtitle="一键套用常用命令组合；应用后可直接在表单中继续修改。"
      icon={<LayoutTemplate size={17} />}
      onClose={onClose}
      wide
      footer={
        <>
          <div className="left">共 {COMMAND_TEMPLATES.length} 个模板</div>
          <button type="button" className="btn" onClick={onClose}>
            关闭
          </button>
        </>
      }
    >
      <div className="template-grid">
        {COMMAND_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            className="template-card"
            disabled={busy}
            onClick={() => void apply(template)}
          >
            <div className="template-icon">
              <Sparkles size={17} />
            </div>
            <div className="template-main">
              <div className="template-title">
                {template.title}
                <span className="command-id">{template.commandLabel}</span>
                {template.packId ? (
                  <span className="badge">{template.packId}</span>
                ) : null}
              </div>
              <div className="template-desc">{template.description}</div>
            </div>
            <span className="btn btn-sm">应用</span>
          </button>
        ))}
      </div>
    </Modal>
  )
}
