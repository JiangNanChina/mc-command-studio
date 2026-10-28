// 项目数据模型：只包含类型与草稿结构，不依赖 store 运行时。
import type {
  BossbarOptions,
  ChainOptions,
  CloneOptions,
  CommandBlockOptions,
  EffectOptions,
  EnchantOptions,
  ExecuteOptions,
  FillOptions,
  GiveOptions,
  ScoreboardOptions,
  ParticleOptions,
  WorldOptions,
  TagOptions,
  ClearOptions,
  GameruleOptions,
  WorldborderOptions,
  TeamOptions,
  SpawnpointOptions,
  WorldSpawnOptions,
  ForceloadOptions,
  AttributeOptions,
  AdvancementOptions,
  FunctionOptions,
  ScheduleOptions,
  ItemOptions,
  NbtGiveOptions,
  GamemodeOptions,
  DamageOptions,
  RotateOptions,
  SpreadplayersOptions,
  RideOptions,
  RandomOptions,
  TickOptions,
  SocialOptions,
  DataOptions,
  LootOptions,
  SetblockOptions,
  SoundOptions,
  SummonOptions,
  TeleportOptions,
  TellrawOptions,
  TitleOptions,
  XpOptions
} from '@mcstudio/core'

export type OutputMode = 'command' | 'command-block'

export interface GenericDraft {
  root: string | null
  steps: { name: string; value?: string }[]
}

export interface DatapackFunctionDraft {
  id: string
  name: string
  commands: string
}

export interface DatapackDataFileDraft {
  id: string
  type: 'advancement' | 'predicate' | 'loot_table'
  name: string
  content: string
}

export interface DatapackDraft {
  namespace: string
  description: string
  functions: DatapackFunctionDraft[]
  activeFunctionId: string
  loadFunction: string
  tickFunction: string
  dataFiles: DatapackDataFileDraft[]
  activeDataFileId: string
}

export interface AutomationOptions {
  advancement: AdvancementOptions
  function: FunctionOptions
  schedule: ScheduleOptions
}

export interface ProjectPayload {
  activeCommandId: string | null
  quickDrafts: Record<string, Record<string, string>>
  give: GiveOptions
  nbtGive: NbtGiveOptions
  gamemode: GamemodeOptions
  damage: DamageOptions
  rotate: RotateOptions
  spreadplayers: SpreadplayersOptions
  ride: RideOptions
  random: RandomOptions
  tick: TickOptions
  social: SocialOptions
  summon: SummonOptions
  setblock: SetblockOptions
  execute: ExecuteOptions
  teleport: TeleportOptions
  effect: EffectOptions
  fill: FillOptions
  clone: CloneOptions
  chain: ChainOptions
  enchant: EnchantOptions
  xp: XpOptions
  tellraw: TellrawOptions
  title: TitleOptions
  sound: SoundOptions
  bossbar: BossbarOptions
  scoreboard: ScoreboardOptions
  particle: ParticleOptions
  world: WorldOptions
  tag: TagOptions
  clear: ClearOptions
  gamerule: GameruleOptions
  worldborder: WorldborderOptions
  team: TeamOptions
  spawnpoint: SpawnpointOptions
  worldSpawn: WorldSpawnOptions
  forceload: ForceloadOptions
  attribute: AttributeOptions
  automation: AutomationOptions
  itemCommand: ItemOptions
  dataCommand: DataOptions
  loot: LootOptions
  datapack: DatapackDraft
  generic: GenericDraft
  commandBlock: CommandBlockOptions
  outputMode: OutputMode
}

export interface Toast {
  id: number
  message: string
  kind: 'info' | 'success' | 'error'
}

export type DialogName = 'settings' | 'about' | 'itemPicker' | 'selector'

