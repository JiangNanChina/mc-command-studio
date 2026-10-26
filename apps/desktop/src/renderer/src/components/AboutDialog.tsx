import { Code2, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react'
import { getApi } from '../lib/api'
import { Modal } from './Modal'
import { useAppStore } from '../store'

export const RELEASES_URL = 'https://github.com/JiangNanChina/mc-command-studio/releases'
export const PROJECT_URL = 'https://github.com/JiangNanChina/mc-command-studio'

export function AboutDialog() {
  const state = useAppStore()
  const info = state.appInfo

  return (
    <Modal
      title="关于 MC 指令工坊"
      subtitle="Windows 桌面版 Minecraft Java 命令编辑器"
      icon={<Sparkles size={17} />}
      onClose={() => state.setDialog('about', false)}
      narrow
      footer={
        <>
          <div className="left">v{info?.version ?? '0.1.0'}</div>
          <button type="button" className="btn btn-primary" onClick={() => state.setDialog('about', false)}>
            知道了
          </button>
        </>
      }
    >
      <div className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
        <div className="welcome-mark" style={{ width: 46, height: 46, borderRadius: 13, fontSize: 18 }}>
          &gt;_
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>MC 指令工坊</div>
          <div className="hint" style={{ marginTop: 3 }}>
            用表单拼出 Minecraft Java 版命令，支持命令方块与本地项目。
          </div>
        </div>
      </div>

      <div className="divider" />

      <div className="hint" style={{ lineHeight: 1.9 }}>
        <div>
          数据包：{state.pack ? `${state.pack.manifest.gameVersion}（pack_format ${state.pack.manifest.packFormat}）` : '未加载'}
        </div>
        <div>命令树：{state.pack?.manifest.counts.roots ?? 0} 个根命令 / {state.pack?.manifest.counts.literals ?? 0} 个字面量</div>
        <div>运行环境：Electron {info?.electron ?? '-'} · Chromium {info?.chrome ?? '-'}</div>
        <div>安装位置：{info?.userData ?? '-'}</div>
      </div>

      <div className="divider" />

      <div className="diag info">
        <ShieldCheck size={15} />
        <span>
          非官方产品：本软件与 Mojang Studios、Microsoft 没有关联，也未获得其批准或认可。
          Minecraft 是 Mojang Studios 的商标。软件不附带任何游戏本体、材质或语言文件。
        </span>
      </div>

      <div className="row wrap" style={{ marginTop: 14 }}>
        <button
          type="button"
          className="btn"
          onClick={() => void getApi().app.openExternal(RELEASES_URL)}
        >
          <Code2 size={14} />
          发布页 / 下载
          <ExternalLink size={12} />
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => void getApi().app.openExternal('https://www.minecraft.net/eula')}
        >
          Minecraft EULA
          <ExternalLink size={12} />
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => void getApi().app.openExternal(PROJECT_URL)}
        >
          项目主页
          <ExternalLink size={12} />
        </button>
      </div>

      <div className="hint" style={{ marginTop: 14 }}>
        代码以 MIT 许可发布；命令中文说明为原创文案。数据包中的命令树与注册表来自官方数据生成器。
      </div>
    </Modal>
  )
}
