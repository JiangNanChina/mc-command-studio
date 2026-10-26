import { CircleAlert, CircleCheck, Clock3, Database, Terminal } from 'lucide-react'
import { getCurrentOutput } from '../lib/commandOutput'
import { useAppStore } from '../store'

function updateText(status: string, version?: string): string {
  switch (status) {
    case 'disabled':
      return '更新：不可用'
    case 'checking':
      return '更新：检查中…'
    case 'available':
      return `更新：v${version ?? ''} 可用`
    case 'downloading':
      return '更新：下载中'
    case 'downloaded':
      return `更新：v${version ?? ''} 待重启`
    case 'error':
      return '更新：失败'
    case 'not-available':
      return '更新：已是最新'
    default:
      return '更新：就绪'
  }
}

export function StatusBar() {
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
    state.generic,
    state.outputMode,
    state.commandBlock
  )
  const errors = output.diagnostics.filter((item) => item.severity === 'error').length
  const warnings = output.diagnostics.filter((item) => item.severity === 'warn').length
  const saved = state.lastAutosaveAt
    ? new Date(state.lastAutosaveAt).toLocaleTimeString('zh-CN', { hour12: false })
    : ''

  return (
    <footer className="statusbar">
      <span className="status-item">
        <Database size={12} />
        {state.pack ? `数据包 ${state.pack.manifest.gameVersion}` : '数据包未加载'}
      </span>
      <span className="status-item">
        <Terminal size={12} />
        {output.text.length} 字符
      </span>
      <span className="status-item">
        {errors > 0 ? (
          <>
            <CircleAlert size={12} style={{ color: 'var(--danger)' }} />
            {errors} 个错误
            {warnings > 0 ? ` · ${warnings} 个警告` : ''}
          </>
        ) : (
          <>
            <CircleCheck size={12} style={{ color: 'var(--accent)' }} />
            校验通过
            {warnings > 0 ? ` · ${warnings} 个警告` : ''}
          </>
        )}
      </span>
      {saved ? (
        <span className="status-item">
          <Clock3 size={12} />
          自动保存 {saved}
        </span>
      ) : null}
      <span className="status-spacer" />
      <span className="status-item">{updateText(state.update.status, state.update.version)}</span>
      <span className="status-item">
        <span className={`dot${state.dirty ? ' warn' : ''}`} />
        {state.dirty ? '未保存' : '已保存'}
      </span>
      <span className="status-item">{state.appInfo ? `v${state.appInfo.version}` : 'v0.1.0'}</span>
    </footer>
  )
}
