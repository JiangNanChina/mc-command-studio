import { lazy, Suspense, useEffect } from 'react'
import { AlertTriangle, Database, FolderOpen, Info, RefreshCw } from 'lucide-react'
import { getApi } from './lib/api'
import { getCurrentOutput } from './lib/commandOutput'
import { supportsLegacyForm } from './lib/packCompat'
import { useAppStore, type DialogName } from './store'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { Welcome } from './components/Welcome'
import { GiveForm } from './components/GiveForm'
import { NbtGiveForm } from './components/NbtGiveForm'
import { GamemodeForm } from './components/GamemodeForm'
import { DamageForm } from './components/DamageForm'
import { RotateForm } from './components/RotateForm'
import { SpreadplayersForm } from './components/SpreadplayersForm'
import { RideForm } from './components/RideForm'
import { RandomForm } from './components/RandomForm'
import { TickForm } from './components/TickForm'
import { SocialForm } from './components/SocialForm'
import { SummonForm } from './components/SummonForm'
import { SetblockForm } from './components/SetblockForm'
import { ExecuteForm } from './components/ExecuteForm'
import { TeleportForm } from './components/TeleportForm'
import { EffectForm } from './components/EffectForm'
import { FillForm } from './components/FillForm'
import { CloneForm } from './components/CloneForm'
import { ChainBuilder } from './components/ChainBuilder'
const DatapackWorkspace = lazy(() =>
  import('./components/DatapackWorkspace').then((module) => ({
    default: module.DatapackWorkspace
  }))
)
import { EnchantForm } from './components/EnchantForm'
import { XpForm } from './components/XpForm'
import { TellrawForm } from './components/TellrawForm'
import { TitleForm } from './components/TitleForm'
import { SoundForm } from './components/SoundForm'
import { BossbarForm } from './components/BossbarForm'
import { ScoreboardForm } from './components/ScoreboardForm'
import { ParticleForm } from './components/ParticleForm'
import { WorldControlForm } from './components/WorldControlForm'
import { TagForm } from './components/TagForm'
import { ClearForm } from './components/ClearForm'
import { GameruleForm } from './components/GameruleForm'
import { WorldborderForm } from './components/WorldborderForm'
import { TeamForm } from './components/TeamForm'
import { WorldSettingsForm } from './components/WorldSettingsForm'
import { AttributeForm } from './components/AttributeForm'
import { AdvancementForm } from './components/AdvancementForm'
import { FunctionForm } from './components/FunctionForm'
import { ScheduleForm } from './components/ScheduleForm'
import { ItemCommandForm } from './components/ItemCommandForm'
import { DataCommandForm } from './components/DataCommandForm'
import { LootForm } from './components/LootForm'
import { GenericBuilder } from './components/GenericBuilder'
import { OocForm } from './components/OocForm'
import { LegacyToolsForm } from './components/LegacyToolsForm'
import { OutputPanel } from './components/OutputPanel'
import { StatusBar } from './components/StatusBar'
import { SettingsDialog } from './components/SettingsDialog'
import { AboutDialog } from './components/AboutDialog'
import { SelectorDialog } from './components/SelectorDialog'
import { ItemPickerDialog } from './components/ItemPickerDialog'
import { UpdateBanner } from './components/UpdateBanner'
import { AnnouncementBanner } from './components/AnnouncementBanner'
import { AnnouncementDialog } from './components/AnnouncementDialog'
import { AutosaveBanner } from './components/AutosaveBanner'
import { Toast } from './components/Toast'
import { QuickCommandForm, isQuickCommand, isNbtQuickSafe } from './components/QuickCommandForm'

function LoadingScreen() {
  return (
    <div className="app">
      <div className="empty" style={{ flex: 1 }}>
        <div className="spinner" />
        <h2>正在加载命令树…</h2>
        <p>读取版本数据包、注册表与物品组件，请稍候。</p>
      </div>
    </div>
  )
}

function ErrorPanel() {
  const state = useAppStore()
  const appInfo = state.appInfo

  return (
    <div className="content">
      <div className="card">
        <div className="card-body">
          <div className="empty" style={{ minHeight: 220 }}>
            <div className="empty-icon" style={{ color: 'var(--danger)' }}>
              <AlertTriangle size={20} />
            </div>
            <h2>数据包加载失败</h2>
            <p>{state.bootError}</p>
            <div className="empty-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void state.loadPack(state.activePackId)}
              >
                <RefreshCw size={14} />
                重试加载
              </button>
              {appInfo ? (
                <button
                  type="button"
                  className="btn"
                  onClick={() => void getApi().app.showItemInFolder(appInfo.packDir)}
                >
                  <FolderOpen size={14} />
                  打开数据包目录
                </button>
              ) : null}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() =>
                  state.showToast('在项目根目录运行：pnpm data:build，然后重启应用。', 'info')
                }
              >
                <Database size={14} />
                如何生成数据包
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const state = useAppStore()
  const bootError = state.bootError
  const booted = state.booted
  const pack = state.pack
  const dirty = state.dirty
  const give = state.give
  const nbtGive = state.nbtGive
  const gamemode = state.gamemode
  const damage = state.damage
  const rotate = state.rotate
  const spreadplayers = state.spreadplayers
  const ride = state.ride
  const random = state.random
  const tick = state.tick
  const social = state.social
  const summon = state.summon
  const setblock = state.setblock
  const execute = state.execute
  const teleport = state.teleport
  const effect = state.effect
  const fill = state.fill
  const clone = state.clone
  const chain = state.chain
  const enchant = state.enchant
  const xp = state.xp
  const tellraw = state.tellraw
  const title = state.title
  const sound = state.sound
  const bossbar = state.bossbar
  const scoreboard = state.scoreboard
  const particle = state.particle
  const world = state.world
  const tag = state.tag
  const clear = state.clear
  const gamerule = state.gamerule
  const worldborder = state.worldborder
  const team = state.team
  const spawnpoint = state.spawnpoint
  const worldSpawn = state.worldSpawn
  const forceload = state.forceload
  const attribute = state.attribute
  const automation = state.automation
  const itemCommand = state.itemCommand
  const dataCommand = state.dataCommand
  const loot = state.loot
  const generic = state.generic
  const commandBlock = state.commandBlock
  const outputMode = state.outputMode
  const activeCommandId = state.activeCommandId
  const projectName = state.projectName
  const toast = state.toast
  const treeOnly = pack?.manifest.engine !== 'components'
  const legacyEngine = pack?.manifest.engine === 'legacy'

  useEffect(() => {
    void useAppStore.getState().boot()
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return
      const key = event.key.toLowerCase()
      if (key === 'k') {
        event.preventDefault()
        document.getElementById('command-search')?.focus()
        return
      }
      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }
      if (key === 'z') {
        event.preventDefault()
        if (event.shiftKey) useAppStore.getState().redo()
        else useAppStore.getState().undo()
      } else if (key === 'y') {
        event.preventDefault()
        useAppStore.getState().redo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const api = window.mcstudio
    if (!api) return
    return api.updater.onEvent((update) => {
      useAppStore.getState().setUpdate(update)
    })
  }, [])

  useEffect(() => {
    const api = window.mcstudio
    if (!api) return
    return api.onMenuAction((action, payload) => {
      const store = useAppStore.getState()
      switch (action) {
        case 'new-project':
          store.newProject()
          break
        case 'open-project':
          void store.openProject()
          break
        case 'open-path':
          if (payload) void store.openProjectPath(payload)
          break
        case 'save-project':
          void store.saveProject()
          break
        case 'save-project-as':
          void store.saveProject(true)
          break
        case 'settings':
          store.setDialog('settings', true)
          break
        case 'about':
          store.setDialog('about', true)
          break
        case 'announcement':
          store.openAnnouncement()
          break
        case 'check-update':
          void store.checkForUpdates(true)
          break
        case 'toggle-theme':
          void store.setTheme(store.settings.theme === 'dark' ? 'light' : 'dark')
          break
      }
    })
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      const mod = event.ctrlKey || event.metaKey
      if (mod && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        document.getElementById('command-search')?.focus()
        return
      }
      if (mod && event.key === 'Enter') {
        event.preventDefault()
        const store = useAppStore.getState()
        const output = getCurrentOutput(
          store.pack,
          store.activeCommandId,
          store.give,
          store.nbtGive,
          store.gamemode,
          store.damage,
          store.rotate,
          store.spreadplayers,
          store.ride,
          store.random,
          store.tick,
          store.social,
          store.summon,
          store.setblock,
          store.execute,
          store.teleport,
          store.effect,
          store.fill,
          store.clone,
          store.chain,
          store.enchant,
          store.xp,
          store.tellraw,
          store.title,
          store.sound,
          store.bossbar,
          store.scoreboard,
          store.particle,
          store.world,
          store.tag,
          store.clear,
          store.gamerule,
          store.worldborder,
          store.team,
          store.spawnpoint,
          store.worldSpawn,
          store.forceload,
          store.attribute,
          store.automation,
          store.itemCommand,
          store.dataCommand,
          store.loot,
          store.generic,
          store.outputMode,
          store.commandBlock
        )
        if (!output.text) return
        void getApi()
          .clipboard.write(output.text)
          .then(() => store.showToast('命令已复制到剪贴板', 'success'))
          .catch(() => store.showToast('复制失败', 'error'))
        return
      }
      if (event.key === 'Escape' && !event.isComposing) {
        const dialogs = useAppStore.getState().dialogs
        for (const [name, open] of Object.entries(dialogs)) {
          if (open) useAppStore.getState().setDialog(name as DialogName, false)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!dirty) return
    const timer = setTimeout(() => {
      void useAppStore.getState().autosave()
    }, 4000)
    return () => clearTimeout(timer)
  }, [dirty, give, nbtGive, gamemode, damage, rotate, spreadplayers, ride, random, tick, social, summon, setblock, execute, teleport, effect, fill, clone, chain, enchant, xp, tellraw, title, sound, bossbar, scoreboard, particle, world, tag, clear, gamerule, worldborder, team, spawnpoint, worldSpawn, forceload, attribute, automation, itemCommand, dataCommand, loot, generic, commandBlock, outputMode, activeCommandId, projectName])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => useAppStore.getState().hideToast(), 4500)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    document.title = `${projectName}${dirty ? ' •' : ''} — MC 指令工坊`
  }, [projectName, dirty])

  useEffect(() => {
    document.querySelector('.main')?.scrollTo({ top: 0 })
  }, [activeCommandId])

  if (!booted) return <LoadingScreen />

  const showWelcome = !activeCommandId

  return (
    <div className="app">
      <Header />
      <div className="banner-stack">
        <AnnouncementBanner />
        <UpdateBanner />
        <AutosaveBanner />
      </div>
      {pack && pack.manifest.id !== '26.3' ? (
        <div className="version-notice">
          <Info size={14} />
          {treeOnly
            ? `当前使用 ${pack.manifest.gameVersion}（NBT 引擎）：give 使用 NBT 表单，召唤/方块/execute 等兼容表单已启用，其余命令使用命令树。`
            : pack.manifest.engine === 'components'
              ? `当前使用 ${pack.manifest.gameVersion}（组件引擎）：give/item 使用组件语法，表单与命令树按该版本生成；跨补丁版使用前请核对。`
              : pack.manifest.engine === 'legacy'
                ? `当前使用 ${pack.manifest.gameVersion}（Legacy 引擎）：使用旧版命令语法与 OOC 生成器。`
                : `当前使用 ${pack.manifest.gameVersion} 数据包：命令树与通用构建器来自该版本；可视化表单按 26.3 语法生成，跨版本使用前请核对。`}
        </div>
      ) : null}
      <div className={`workspace${activeCommandId === 'datapack' ? ' no-output' : ''}`}>
        <Sidebar />
        <main className="main">
          {!pack ? (
            bootError ? (
              <ErrorPanel />
            ) : (
              <div className="empty">
                <div className="spinner" />
                <p>数据包加载中…</p>
              </div>
            )
          ) : showWelcome ? (
            <Welcome />
          ) : activeCommandId === 'datapack' ? (
            <Suspense fallback={<div className="empty">数据包编辑器加载中…</div>}>
              <DatapackWorkspace />
            </Suspense>
          ) : activeCommandId === 'chain' ? (
            <ChainBuilder />
          ) : activeCommandId === 'ooc' ? (
            <OocForm />
          ) : activeCommandId === 'legacy-tools' ? (
            <LegacyToolsForm />
          ) : treeOnly && !legacyEngine && isNbtQuickSafe(activeCommandId) ? (
            <QuickCommandForm key={activeCommandId} id={activeCommandId} />
          ) : treeOnly && (legacyEngine || !supportsLegacyForm(activeCommandId ?? '')) ? (
            <GenericBuilder />
          ) : activeCommandId === 'give' ? (
            pack?.manifest.engine === 'nbt' ? (
              <NbtGiveForm />
            ) : (
              <GiveForm />
            )
          ) : activeCommandId === 'gamemode' ? (
            <GamemodeForm />
          ) : activeCommandId === 'damage' ? (
            <DamageForm />
          ) : activeCommandId === 'rotate' ? (
            <RotateForm />
          ) : activeCommandId === 'spreadplayers' ? (
            <SpreadplayersForm />
          ) : activeCommandId === 'ride' ? (
            <RideForm />
          ) : activeCommandId === 'random' ? (
            <RandomForm />
          ) : activeCommandId === 'tick' ? (
            <TickForm />
          ) : ['say', 'msg', 'kill', 'list', 'seed', 'me', 'kick', 'op', 'deop'].includes(activeCommandId ?? '') ? (
            <SocialForm />
          ) : activeCommandId === 'summon' ? (
            <SummonForm />
          ) : activeCommandId === 'setblock' ? (
            <SetblockForm />
          ) : activeCommandId === 'execute' ? (
            <ExecuteForm />
          ) : activeCommandId === 'tp' ? (
            <TeleportForm />
          ) : activeCommandId === 'effect' ? (
            <EffectForm />
          ) : activeCommandId === 'fill' ? (
            <FillForm />
          ) : activeCommandId === 'clone' ? (
            <CloneForm />
          ) : activeCommandId === 'chain' ? (
            <ChainBuilder />
          ) : activeCommandId === 'datapack' ? (
            <Suspense fallback={<div className="empty">数据包编辑器加载中…</div>}>
              <DatapackWorkspace />
            </Suspense>
          ) : activeCommandId === 'enchant' ? (
            <EnchantForm />
          ) : activeCommandId === 'xp' ? (
            <XpForm />
          ) : activeCommandId === 'tellraw' ? (
            <TellrawForm />
          ) : activeCommandId === 'title' ? (
            <TitleForm />
          ) : activeCommandId === 'playsound' || activeCommandId === 'stopsound' ? (
            <SoundForm />
          ) : activeCommandId === 'bossbar' ? (
            <BossbarForm />
          ) : activeCommandId === 'scoreboard' ? (
            <ScoreboardForm />
          ) : activeCommandId === 'particle' ? (
            <ParticleForm />
          ) : activeCommandId === 'time' ||
            activeCommandId === 'weather' ||
            activeCommandId === 'difficulty' ? (
            <WorldControlForm />
          ) : activeCommandId === 'tag' ? (
            <TagForm />
          ) : activeCommandId === 'clear' ? (
            <ClearForm />
          ) : activeCommandId === 'gamerule' ? (
            <GameruleForm />
          ) : activeCommandId === 'worldborder' ? (
            <WorldborderForm />
          ) : activeCommandId === 'team' ? (
            <TeamForm />
          ) : activeCommandId === 'spawnpoint' ||
            activeCommandId === 'setworldspawn' ||
            activeCommandId === 'forceload' ? (
            <WorldSettingsForm />
          ) : activeCommandId === 'attribute' ? (
            <AttributeForm />
          ) : activeCommandId === 'advancement' ? (
            <AdvancementForm />
          ) : activeCommandId === 'function' ? (
            <FunctionForm />
          ) : activeCommandId === 'schedule' ? (
            <ScheduleForm />
          ) : activeCommandId === 'item' ? (
            <ItemCommandForm />
          ) : activeCommandId === 'data' ? (
            <DataCommandForm />
          ) : activeCommandId === 'loot' ? (
            <LootForm />
          ) : activeCommandId ? (
            isQuickCommand(activeCommandId) ? (
              <QuickCommandForm key={activeCommandId} id={activeCommandId} />
            ) : (
              <GenericBuilder />
            )
          ) : (
            <GenericBuilder />
          )}
        </main>
        {activeCommandId === 'datapack' ? null : <OutputPanel />}
      </div>
      <StatusBar />

      {state.dialogs.settings ? <SettingsDialog /> : null}
      {state.dialogs.about ? <AboutDialog /> : null}
      {state.announcementOpen ? <AnnouncementDialog /> : null}
      {state.dialogs.selector ? <SelectorDialog /> : null}
      {state.dialogs.itemPicker ? <ItemPickerDialog /> : null}
      <Toast />
    </div>
  )
}
