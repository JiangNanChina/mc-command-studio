import { createTextSegment } from '@mcstudio/core'
import { useAppStore } from '../store'

export interface CommandTemplate {
  id: string
  title: string
  description: string
  commandId: string
  commandLabel: string
  apply: () => void
}

export const COMMAND_TEMPLATES: CommandTemplate[] = [
  {
    id: 'starter-kit',
    title: '新手礼包',
    description: '给最近的玩家 16 个面包，打开即可用的 give 示例。',
    commandId: 'give',
    commandLabel: 'give',
    apply: () => {
      const state = useAppStore.getState()
      state.applyGiveImport({
        target: { base: '@p' },
        count: 16,
        item: { id: 'minecraft:bread', components: [] }
      })
    }
  },
  {
    id: 'heal-all',
    title: '全服回血',
    description: '给所有玩家 10 秒生命恢复 II，适合活动开始前使用。',
    commandId: 'effect',
    commandLabel: 'effect',
    apply: () => {
      const state = useAppStore.getState()
      state.updateEffect({
        action: 'give',
        target: { base: '@a' },
        effect: 'minecraft:regeneration',
        duration: '10',
        amplifier: '1',
        hideParticles: false,
        permanent: false
      })
      state.selectCommand('effect')
    }
  },
  {
    id: 'welcome-title',
    title: '欢迎语',
    description: '向所有玩家发送金色加粗的欢迎文本。',
    commandId: 'tellraw',
    commandLabel: 'tellraw',
    apply: () => {
      const state = useAppStore.getState()
      state.updateTellraw({
        target: { base: '@a' },
        segments: [
          {
            ...createTextSegment(),
            text: '欢迎来到服务器！',
            color: 'gold',
            bold: true
          }
        ]
      })
      state.selectCommand('tellraw')
    }
  },
  {
    id: 'event-bossbar',
    title: '活动 BOSS 栏',
    description: '创建金色、10 段式活动进度条，最大值 300。',
    commandId: 'bossbar',
    commandLabel: 'bossbar',
    apply: () => {
      const state = useAppStore.getState()
      state.updateBossbar({
        action: 'create',
        id: 'mcstudio:event',
        name: '活动进行中',
        color: 'yellow',
        style: 'notched_10',
        max: '300',
        value: '300',
        visible: true,
        playersEnabled: true,
        players: { base: '@a' },
        field: 'max'
      })
      state.selectCommand('bossbar')
    }
  },
  {
    id: 'kill-scoreboard',
    title: '击杀计分板',
    description: '创建 playerKillCount 计分目标并显示在侧边栏。',
    commandId: 'scoreboard',
    commandLabel: 'scoreboard',
    apply: () => {
      const state = useAppStore.getState()
      state.updateScoreboard({
        action: 'objective-add',
        objective: 'kills',
        criteria: 'playerKillCount',
        displayName: '击杀数',
        slot: 'sidebar',
        target: { base: '@s' },
        score: '0',
        operation: '=',
        source: { base: '@s' },
        sourceObjective: 'kills',
        modifyField: 'displayname',
        autoUpdate: true,
        numberFormat: 'blank',
        numberFormatValue: '{"text":"#","color":"gold"}',
        renderType: 'integer'
      })
      state.selectCommand('scoreboard')
    }
  },
  {
    id: 'red-team',
    title: '红队',
    description: '创建红队、红色名字前缀，并设置友伤关闭。',
    commandId: 'team',
    commandLabel: 'team',
    apply: () => {
      const state = useAppStore.getState()
      state.updateTeam({
        action: 'create',
        name: 'red',
        displayName: '红队',
        color: 'red',
        friendlyFire: false,
        seeFriendlyInvisibles: true,
        nametagVisibility: 'always',
        collisionRule: 'always',
        target: { base: '@a' },
        prefix: [
          {
            ...createTextSegment(),
            text: '[红] ',
            color: 'red',
            bold: true
          }
        ],
        suffix: [],
        displayAdvanced: false,
        displaySegments: []
      })
      state.selectCommand('team')
    }
  },
  {
    id: 'scheduled-welcome',
    title: '定时公告',
    description: '5 分钟后运行 mcstudio:welcome 函数（需数据包中存在）。',
    commandId: 'schedule',
    commandLabel: 'schedule',
    apply: () => {
      const state = useAppStore.getState()
      state.updateSchedule({
        action: 'function',
        functionName: 'mcstudio:welcome',
        time: '5m',
        mode: 'replace'
      })
      state.selectCommand('schedule')
    }
  }
]
