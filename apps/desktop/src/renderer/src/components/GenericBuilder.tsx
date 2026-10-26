import { useState } from 'react'
import {
  ArrowLeft,
  ChevronRight,
  CornerDownRight,
  Layers3,
  RotateCcw,
  Terminal,
  Wrench
} from 'lucide-react'
import { COMMAND_MAP } from '@mcstudio/content'
import {
  describeParser,
  isArgument,
  isExecutable,
  permissionLabel,
  type CommandNodeData
} from '@mcstudio/core'
import { useAppStore, selectGenericNode } from '../store'

function ArgumentRow({
  name,
  node,
  onAdd
}: {
  name: string
  node: CommandNodeData
  onAdd: (value: string) => void
}) {
  const info = describeParser(node.parser)
  const [value, setValue] = useState('')

  return (
    <div className="field">
      <div className="field-label">
        {name}
        <span className="badge">{info.label}</span>
        <span className="hint">{info.hint}</span>
      </div>
      <div className="row">
        <input
          className="input"
          value={value}
          placeholder={info.placeholder}
          spellCheck={false}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing && value.trim()) {
              event.preventDefault()
              onAdd(value.trim())
            }
          }}
        />
        <button
          type="button"
          className="btn"
          disabled={!value.trim()}
          onClick={() => {
            if (!value.trim()) return
            onAdd(value.trim())
          }}
        >
          添加
        </button>
      </div>
    </div>
  )
}

export function GenericBuilder() {
  const state = useAppStore()
  const draft = state.generic
  const node = selectGenericNode(state.pack, draft)
  const root = draft.root
  const meta = root ? COMMAND_MAP.get(root) : undefined

  if (!root) {
    return (
      <div className="empty">
        <div className="empty-icon">
          <Wrench size={20} />
        </div>
        <h2>通用命令构建器</h2>
        <p>从左侧选择一条命令开始。通用构建器会按官方命令树逐层引导，适用于所有 94 个根命令。</p>
      </div>
    )
  }

  if (!node) {
    return (
      <div className="empty">
        <div className="empty-icon">
          <RotateCcw size={20} />
        </div>
        <h2>路径已失效</h2>
        <p>当前版本找不到这条路径，可能切换了数据包。请重置构建器。</p>
        <button type="button" className="btn" onClick={() => state.resetGeneric()}>
          返回起点
        </button>
      </div>
    )
  }

  const children = Object.entries(node.children ?? {}).map(([name, child]) => ({ name, node: child }))
  const literals = children.filter((child) => child.node.type === 'literal')
  const args = children.filter((child) => isArgument(child.node))
  const executable = isExecutable(node)
  const permission = permissionLabel(node)

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">
            命令库 / 通用构建器 / {root}
          </div>
          <div className="hero">
            <div className="hero-icon">
              <Terminal size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                {meta?.name ?? root}
                <span className="hero-id">{root}</span>
              </h1>
              <p className="hero-sub">
                {meta?.description ??
                  '该命令还没有中文说明，按官方命令树逐层选择字面量与参数即可拼出完整命令。'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Layers3 size={15} />
            命令路径
          </div>
          <div className="row">
            <button
              type="button"
              className="btn btn-sm"
              disabled={draft.steps.length === 0}
              onClick={() => state.popGenericStep()}
            >
              <ArrowLeft size={13} />
              上一步
            </button>
            <button type="button" className="btn btn-sm" onClick={() => state.resetGeneric()}>
              <RotateCcw size={13} />
              重置
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="row wrap" style={{ gap: 6 }}>
            <button type="button" className="chip" onClick={() => state.truncateGeneric(0)}>
              {root}
            </button>
            {draft.steps.map((step, index) => (
              <span key={`${step.name}-${index}`} className="row" style={{ gap: 6 }}>
                <ChevronRight size={13} style={{ color: 'var(--faint)' }} />
                <button
                  type="button"
                  className="chip"
                  title="回到这一步"
                  onClick={() => state.truncateGeneric(index + 1)}
                >
                  {step.name}
                  {step.value !== undefined ? (
                    <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)' }}>= {step.value}</span>
                  ) : null}
                </button>
              </span>
            ))}
          </div>

          <div className="divider" />

          {literals.length > 0 ? (
            <>
              <div className="section-label">选择字面量子命令</div>
              <div className="row wrap">
                {literals.map((child) => (
                  <button
                    key={child.name}
                    type="button"
                    className="btn"
                    onClick={() => state.pushGenericStep({ name: child.name })}
                  >
                    <CornerDownRight size={14} />
                    {child.name}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {args.length > 0 ? (
            <>
              <div className="section-label" style={{ marginTop: literals.length > 0 ? 18 : 0 }}>
                填写参数
              </div>
              {args.map((child) => (
                <ArgumentRow
                  key={`${draft.steps.length}-${child.name}`}
                  name={child.name}
                  node={child.node}
                  onAdd={(value) => state.pushGenericStep({ name: child.name, value })}
                />
              ))}
            </>
          ) : null}

          {literals.length === 0 && args.length === 0 ? (
            <div className="output-note">
              <div className="row" style={{ gap: 7 }}>
                <Terminal size={14} />
                这条路径已经到达终点
                {executable ? '，可以直接输出命令。' : '，但该节点不可执行。'}
              </div>
            </div>
          ) : null}

          {executable ? (
            <div className="diag info" style={{ marginTop: 14 }}>
              <Terminal size={14} />
              <span>当前节点可以执行，右侧输出面板会实时显示完整命令。</span>
            </div>
          ) : null}

          {permission ? (
            <div className="hint" style={{ marginTop: 10 }}>
              {permission}
            </div>
          ) : null}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Wrench size={15} />
            使用提示
          </div>
        </div>
        <div className="card-body">
          <div className="hint" style={{ lineHeight: 1.8 }}>
            1. 蓝色按钮是命令树中的字面量（子命令），点击进入下一层。
            <br />
            2. 参数会显示类型提示；无法用专用编辑器覆盖的参数以原始文本输入，仍会做基础格式校验。
            <br />
            3. 到达可执行节点后，可以在右侧切换“命令方块”模式，生成放置命令方块的 setblock。
            {meta?.example ? (
              <>
                <br />
                示例：
                <code className="code-inline" style={{ marginLeft: 6 }}>
                  /{meta.example}
                </code>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
