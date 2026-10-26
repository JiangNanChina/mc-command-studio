import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import {
  AlertTriangle,
  Check,
  Clipboard,
  Info,
  Terminal,
  Boxes
} from 'lucide-react'
import {
  BLOCK_FACINGS,
  permissionLabel,
  type BlockFacing,
  type CommandNodeData,
  type Diagnostic
} from '@mcstudio/core'
import { getApi } from '../lib/api'
import { getCurrentOutput } from '../lib/commandOutput'
import { useAppStore } from '../store'

const outputTheme = EditorView.theme(
  {
    '&': {
      color: '#dbe9f6',
      backgroundColor: '#0b1219',
      fontSize: '12.5px'
    },
    '.cm-content': {
      caretColor: '#3ddc97',
      color: '#dbe9f6',
      padding: '10px 0'
    },
    '.cm-line': {
      padding: '0 12px'
    },
    '&.cm-focused': {
      outline: 'none'
    },
    '.cm-scroller': {
      maxHeight: '260px',
      overflow: 'auto',
      lineHeight: '1.65',
      backgroundColor: '#0b1219'
    },
    '.cm-selectionBackground, ::selection': {
      backgroundColor: '#24425a !important'
    }
  },
  { dark: true }
)

function CodeView({ text }: { text: string }) {
  const host = useRef<HTMLDivElement>(null)
  const view = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!host.current) return
    const state = EditorState.create({
      doc: text,
      extensions: [
        EditorState.readOnly.of(true),
        EditorView.editable.of(false),
        outputTheme,
        EditorView.contentAttributes.of({ 'aria-label': '生成的命令' })
      ]
    })
    const editor = new EditorView({ state, parent: host.current })
    view.current = editor
    return () => {
      editor.destroy()
      view.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const editor = view.current
    if (!editor) return
    const current = editor.state.doc.toString()
    if (current !== text) {
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: text }
      })
    }
  }, [text])

  return <div ref={host} />
}

function SeverityIcon({ severity }: { severity: Diagnostic['severity'] }) {
  if (severity === 'error') return <AlertTriangle size={14} />
  if (severity === 'warn') return <AlertTriangle size={14} />
  return <Info size={14} />
}

function CommandBlockFields() {
  const commandBlock = useAppStore((state) => state.commandBlock)
  const setCommandBlock = useAppStore((state) => state.setCommandBlock)

  return (
    <div>
      <div className="section-label">命令方块位置</div>
      <div className="commandblock-grid">
        <input
          className="input"
          value={commandBlock.x}
          aria-label="X 坐标"
          onChange={(event) => setCommandBlock({ x: event.target.value })}
        />
        <input
          className="input"
          value={commandBlock.y}
          aria-label="Y 坐标"
          onChange={(event) => setCommandBlock({ y: event.target.value })}
        />
        <input
          className="input"
          value={commandBlock.z}
          aria-label="Z 坐标"
          onChange={(event) => setCommandBlock({ z: event.target.value })}
        />
      </div>
      <div className="grid-2" style={{ marginTop: 8 }}>
        <select
          className="select"
          value={commandBlock.facing}
          aria-label="朝向"
          onChange={(event) => setCommandBlock({ facing: event.target.value as BlockFacing })}
        >
          {BLOCK_FACINGS.map((facing) => (
            <option key={facing.value} value={facing.value}>
              朝向：{facing.label}
            </option>
          ))}
        </select>
        <div className="cb-toggle-row">
          <label className="checkline">
            <input
              type="checkbox"
              checked={commandBlock.conditional}
              onChange={(event) => setCommandBlock({ conditional: event.target.checked })}
            />
            有条件
          </label>
          <label className="checkline">
            <input
              type="checkbox"
              checked={commandBlock.auto}
              onChange={(event) => setCommandBlock({ auto: event.target.checked })}
            />
            保持开启
          </label>
          <label className="checkline">
            <input
              type="checkbox"
              checked={commandBlock.powered}
              onChange={(event) => setCommandBlock({ powered: event.target.checked })}
            />
            已激活
          </label>
          <label className="checkline">
            <input
              type="checkbox"
              checked={commandBlock.trackOutput}
              onChange={(event) => setCommandBlock({ trackOutput: event.target.checked })}
            />
            记录输出
          </label>
        </div>
      </div>
    </div>
  )
}

export function OutputPanel() {
  const state = useAppStore()
  const output = getCurrentOutput(
    state.pack,
    state.activeCommandId,
    state.give,
    state.summon,
    state.setblock,
    state.execute,
    state.teleport,
    state.effect,
    state.fill,
    state.clone,
    state.chain,
    state.enchant,
    state.xp,
    state.tellraw,
    state.title,
    state.sound,
    state.bossbar,
    state.scoreboard,
    state.particle,
    state.world,
    state.tag,
    state.clear,
    state.gamerule,
    state.worldborder,
    state.team,
    state.spawnpoint,
    state.worldSpawn,
    state.forceload,
    state.attribute,
    state.automation,
    state.generic,
    state.outputMode,
    state.commandBlock
  )
  const commandMode = state.outputMode === 'command'
  const chainMode = state.activeCommandId === 'chain'
  const multiLineMode =
    chainMode ||
    state.activeCommandId === 'bossbar' ||
    state.activeCommandId === 'team' ||
    (state.activeCommandId === 'title' && state.title.times)
  const permission = state.activeCommandId
    ? permissionLabel(
        state.pack?.commands.children?.[state.activeCommandId] ??
          ({ type: 'literal' } as CommandNodeData)
      )
    : ''

  const copy = async (): Promise<void> => {
    if (!output.text) return
    try {
      await getApi().clipboard.write(output.text)
      state.showToast(chainMode ? '整链命令已复制' : commandMode ? '命令已复制到剪贴板' : 'setblock 命令已复制', 'success')
    } catch (error) {
      state.showToast(`复制失败：${error instanceof Error ? error.message : String(error)}`, 'error')
    }
  }

  return (
    <section className="output" aria-label="输出面板">
      <div className="output-head">
        <div className="output-title">
          <Terminal size={15} />
          实时输出
        </div>
        <div className="tabs" role="tablist" aria-label="输出模式">
          <button
            type="button"
            role="tab"
            aria-selected={commandMode}
            className={`tab${commandMode ? ' active' : ''}`}
            onClick={() => state.setOutputMode('command')}
          >
            命令
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!commandMode}
            className={`tab${!commandMode ? ' active' : ''}`}
            disabled={multiLineMode}
            title={multiLineMode ? '当前输出是多行命令，不能包进单个命令方块' : undefined}
            onClick={() => state.setOutputMode('command-block')}
          >
            命令方块
          </button>
        </div>
      </div>

      <div className="output-body">
        {!commandMode ? <CommandBlockFields /> : null}

        <div className="output-code">
          {output.text ? (
            <CodeView text={output.text} />
          ) : (
            <div className="list-empty">
              选择一条命令并填写必填参数后，这里会实时生成结果。
            </div>
          )}
        </div>

        <div className="output-foot">
          <span>{output.text.length} 字符 · 上限 32,500</span>
          {output.hasErrors ? <span style={{ color: 'var(--danger)' }}>存在错误</span> : null}
          {!output.hasErrors && output.text ? <span>格式检查通过</span> : null}
        </div>

        <div className="output-actions">
          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={() => void copy()}
            disabled={!output.text}
          >
            <Clipboard size={15} />
            {commandMode ? '复制命令' : '复制 setblock'}
          </button>
          <button
            type="button"
            className="btn"
            title="把命令放进命令方块视图"
            disabled={multiLineMode}
            onClick={() => state.setOutputMode(commandMode ? 'command-block' : 'command')}
          >
            <Boxes size={15} />
          </button>
        </div>

        {output.diagnostics.length > 0 ? (
          <div className="diagnostics">
            {output.diagnostics.map((diagnostic, index) => (
              <div key={`${diagnostic.code}-${index}`} className={`diag ${diagnostic.severity}`}>
                <SeverityIcon severity={diagnostic.severity} />
                <span>{diagnostic.message}</span>
              </div>
            ))}
          </div>
        ) : null}

        {output.text && !output.hasErrors ? (
          <div className="diag info">
            <Check size={14} />
            <span>
              {commandMode
                ? '可直接粘贴到聊天栏或命令方块；单人世界需开启作弊。'
                : '在游戏中执行这条 setblock，即可在指定位置放置已写入命令的命令方块。'}
            </span>
          </div>
        ) : null}

        <div className="output-note">
          {commandMode ? (
            <>
              提示：命令方块最多 32,500 字符；目标为 <code className="code-inline">@s</code> 时，只有在玩家执行上下文中才有意义。
            </>
          ) : (
            <>
              提示：命令方块中的命令同样受 32,500 字符限制。生成的是 <code className="code-inline">setblock</code>{' '}
              命令，不会直接改变世界以外的内容。
            </>
          )}
          {permission ? <div style={{ marginTop: 6 }}>{permission}</div> : null}
        </div>
      </div>
    </section>
  )
}
