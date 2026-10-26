import {
  ArrowDown,
  ArrowUp,
  Blocks,
  Copy,
  Link2,
  Plus,
  Trash2
} from 'lucide-react'
import {
  buildChainCommands,
  CHAIN_KIND_LABELS,
  type BlockFacing,
  type ChainBlockKind
} from '@mcstudio/core'
import { getApi } from '../lib/api'
import { PositionInput } from './PositionInput'
import { useAppStore } from '../store'

const DIRECTIONS: { value: BlockFacing; label: string }[] = [
  { value: 'east', label: '东 +X' },
  { value: 'west', label: '西 -X' },
  { value: 'south', label: '南 +Z' },
  { value: 'north', label: '北 -Z' },
  { value: 'up', label: '上 +Y' },
  { value: 'down', label: '下 -Y' }
]

export function ChainBuilder() {
  const state = useAppStore()
  const chain = state.chain
  const output = buildChainCommands(chain)

  const copyAll = async (): Promise<void> => {
    if (!output.text) return
    try {
      await getApi().clipboard.write(output.text)
      state.showToast(`已复制 ${chain.blocks.length} 条 setblock 命令`, 'success')
    } catch (error) {
      state.showToast(`复制失败：${error instanceof Error ? error.message : String(error)}`, 'error')
    }
  }

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="crumb">工具 / 命令方块链</div>
          <div className="hero">
            <div className="hero-icon">
              <Link2 size={21} />
            </div>
            <div>
              <h1 className="hero-title">
                命令方块链
                <span className="hero-id">chain</span>
              </h1>
              <p className="hero-sub">
                按方向排布多个命令方块，生成整链 <code className="code-inline">/setblock</code>
                ；连锁块默认保持开启，脉冲块默认需要红石。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Blocks size={15} />
            起点与方向
          </div>
          <div className="card-hint">链沿该方向逐格延伸</div>
        </div>
        <div className="card-body">
          <PositionInput
            label="第一个命令方块的坐标"
            value={chain.origin}
            onChange={(origin) => state.updateChain({ origin })}
          />
          <div className="field" style={{ marginTop: 12 }}>
            <label className="field-label" htmlFor="chain-direction">
              延伸方向 / 方块朝向
            </label>
            <select
              id="chain-direction"
              className="select"
              value={chain.direction}
              onChange={(event) =>
                state.updateChain({ direction: event.target.value as BlockFacing })
              }
            >
              {DIRECTIONS.map((direction) => (
                <option key={direction.value} value={direction.value}>
                  {direction.label}
                </option>
              ))}
            </select>
            <div className="hint">
              支持绝对坐标和 <code className="code-inline">~</code> 相对坐标；不支持{' '}
              <code className="code-inline">^</code> 局部坐标。
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Link2 size={15} />
            命令方块
            <span className="badge">{chain.blocks.length}</span>
          </div>
          <button
            type="button"
            className="btn btn-sm"
            disabled={chain.blocks.length >= 64}
            onClick={() => state.addChainBlock()}
          >
            <Plus size={13} />
            添加方块
          </button>
        </div>
        <div className="card-body">
          {chain.blocks.length === 0 ? (
            <div className="component-empty">还没有命令方块，点击“添加方块”开始。</div>
          ) : (
            chain.blocks.map((block, index) => (
              <div className="chain-block" key={block.id}>
                <div className="chain-block-head">
                  <span className="execute-index">{index + 1}</span>
                  <select
                    className="select"
                    style={{ width: 210 }}
                    value={block.kind}
                    onChange={(event) => {
                      const kind = event.target.value as ChainBlockKind
                      state.updateChainBlock(block.id, { kind, auto: kind !== 'impulse' })
                    }}
                  >
                    {Object.entries(CHAIN_KIND_LABELS).map(([kind, label]) => (
                      <option key={kind} value={kind}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <label className="checkline">
                    <input
                      type="checkbox"
                      checked={block.conditional}
                      onChange={(event) =>
                        state.updateChainBlock(block.id, { conditional: event.target.checked })
                      }
                    />
                    有条件
                  </label>
                  <label className="checkline">
                    <input
                      type="checkbox"
                      checked={block.auto}
                      onChange={(event) =>
                        state.updateChainBlock(block.id, { auto: event.target.checked })
                      }
                    />
                    保持开启
                  </label>
                  <span style={{ flex: 1 }} />
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="上移方块"
                    disabled={index === 0}
                    onClick={() => state.moveChainBlock(block.id, -1)}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="下移方块"
                    disabled={index === chain.blocks.length - 1}
                    onClick={() => state.moveChainBlock(block.id, 1)}
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="删除方块"
                    onClick={() => state.removeChainBlock(block.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <textarea
                  className="textarea"
                  style={{ marginTop: 10 }}
                  placeholder="命令，不带前导 /"
                  value={block.command}
                  onChange={(event) =>
                    state.updateChainBlock(block.id, { command: event.target.value })
                  }
                />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Copy size={15} />
            整链输出
          </div>
          <div className="row">
            <span className="card-hint">{output.text ? output.text.split('\n').length : 0} 条命令</span>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              disabled={!output.text}
              onClick={() => void copyAll()}
            >
              <Copy size={13} />
              复制全部
            </button>
          </div>
        </div>
        <div className="card-body">
          <pre className="chain-preview">{output.text || '添加命令方块后生成…'}</pre>
          {output.diagnostics.length > 0 ? (
            <div className="diagnostics" style={{ marginTop: 10 }}>
              {output.diagnostics.map((diagnostic, index) => (
                <div key={`${diagnostic.code}-${index}`} className={`diag ${diagnostic.severity}`}>
                  <span>{diagnostic.message}</span>
                </div>
              ))}
            </div>
          ) : null}
          <div className="hint" style={{ marginTop: 8 }}>
            把每条 setblock 依次执行即可生成整链；右侧输出面板同样会显示这些命令。
          </div>
        </div>
      </div>
    </div>
  )
}
