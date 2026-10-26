import { ArrowRight, FolderOpen, Sparkles, Terminal, Wand2 } from 'lucide-react'
import { COMMANDS } from '@mcstudio/content'
import icon from '../assets/icon.png'
import { useAppStore } from '../store'

const QUICK_IDS = ['give', 'summon', 'setblock', 'execute', 'effect', 'tellraw']

export function Welcome() {
  const state = useAppStore()
  const quick = COMMANDS.filter((command) => QUICK_IDS.includes(command.id))
  const recent = state.settings.recentProjects.slice(0, 5)

  return (
    <div className="welcome">
      <div className="welcome-mark">
        <img src={icon} alt="MC 指令工坊" />
      </div>
      <h1>把命令拼出来，而不是背语法。</h1>
      <p>
        选择命令、填写参数、实时得到可复制的 Java 版命令。当前内置 Minecraft{' '}
        <strong>{state.pack?.manifest.gameVersion ?? '26.3'}</strong> 的完整命令树与注册表，断网也能使用。
      </p>

      <div className="quick-grid">
        {quick.map((command) => (
          <button
            key={command.id}
            type="button"
            className="quick-card"
            onClick={() => state.selectCommand(command.id)}
          >
            <div className="id">{command.id}</div>
            <div className="name">{command.name}</div>
            <div className="desc">{command.description}</div>
          </button>
        ))}
      </div>

      <div className="welcome-steps">
        <div className="step">
          <span className="step-num">1</span>
          <span>在左侧选一条命令；没有中文说明的命令也能用通用构建器生成。</span>
        </div>
        <div className="step">
          <span className="step-num">2</span>
          <span>在表单里填目标、物品与组件，右侧会实时更新命令与校验结果。</span>
        </div>
        <div className="step">
          <span className="step-num">3</span>
          <span>复制命令，或切换成命令方块模式生成 /setblock，保存项目以便下次继续。</span>
        </div>
      </div>

      {recent.length > 0 ? (
        <div className="recent-list">
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 7 }}>
            <FolderOpen size={14} />
            最近打开
          </div>
          {recent.map((project) => (
            <button
              key={project.path}
              type="button"
              className="recent-row"
              onClick={() => state.openProjectPath(project.path)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Terminal size={14} style={{ color: 'var(--faint)' }} />
                {project.name}
              </span>
              <span className="recent-path">{project.path}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        <button type="button" className="btn btn-primary" onClick={() => state.selectCommand('give')}>
          <Sparkles size={15} />
          从 give 开始
          <ArrowRight size={15} />
        </button>
        <button type="button" className="btn" onClick={() => state.openProject()}>
          <FolderOpen size={15} />
          打开已有项目
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => state.setDialog('about', true)}>
          <Wand2 size={15} />
          了解工作台
        </button>
      </div>
    </div>
  )
}
