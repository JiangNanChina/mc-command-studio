export type ChangeType = 'added' | 'improved' | 'fixed' | 'known'

export interface ChangelogSection {
  type: ChangeType
  items: string[]
}

export interface ChangelogEntry {
  version: string
  date: string
  title: string
  highlights: string[]
  sections: ChangelogSection[]
  releaseUrl?: string
}

const REPO = 'https://github.com/JiangNanChina/mc-command-studio'

/**
 * 内置更新日志。每次发布新版本时，必须在顶部新增一条与 package.json 版本一致的记录，
 * `tools/release/verify-version.mjs` 会检查这一点。
 */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.1.4',
    date: '2026-10-26',
    title: '高频表单：tp / effect / fill',
    highlights: [
      '新增 tp、effect、fill 三个专用表单，目标/坐标/方块不再手写。',
      '抽出可复用坐标输入与选择器字段，表单体验保持一致。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'tp：传送到坐标或实体，可选偏航/俯仰。',
          'effect：give/clear、状态效果补全、时长、等级、隐藏粒子。',
          'fill：起止坐标、方块状态、6 种模式、replace 过滤方块。'
        ]
      },
      {
        type: 'improved',
        items: [
          '项目文件保存 tp/effect/fill 状态。',
          '单元测试 77 → 86；冒烟测试覆盖三个新表单。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      },
      {
        type: 'known',
        items: ['tp 以实体为目标时不支持同时设置朝向。', '安装包尚未配置代码签名。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.4`
  },
  {
    version: '0.1.3',
    date: '2026-10-26',
    title: 'execute 执行链与数据包导出',
    highlights: [
      '新增 execute 执行链：as/at/positioned/if… 积木可排序，最后用 run 执行。',
      '当前命令可一键导出为 Minecraft 数据包（.zip），支持 load / tick 标签。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'execute 执行链：as、at、positioned、align、anchored、facing、rotated、in、if/unless、store、原始子命令。',
          '条件构建：实体、方块、计分板比较、原始条件。',
          '数据包导出：pack.mcmeta + data/<namespace>/function/<name>.mcfunction，可选 load / tick 标签。',
          '选择器弹窗可复用于 execute 子命令与条件。'
        ]
      },
      {
        type: 'improved',
        items: [
          '项目文件保存 execute 执行链，旧项目自动补默认值。',
          '单元测试 69 → 77；冒烟测试覆盖 execute 与数据包导出。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      },
      {
        type: 'known',
        items: [
          'store 目前只提供 score 目标；block/bossbar/entity/storage 请用原始子命令。',
          '安装包尚未配置代码签名。'
        ]
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.3`
  },
  {
    version: '0.1.2',
    date: '2026-10-26',
    title: '更新公告与版本历史',
    highlights: [
      '新增内置更新公告：更新后首次启动显示横幅，顶栏铃铛随时查看历史版本。',
      '公告按“新增 / 改进 / 修复 / 已知问题”分类，并链接到对应 GitHub Release。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          '更新公告横幅：当前版本未读时显示，可一键查看或标记已读。',
          '版本历史弹窗：查看 0.1.0 以来每个版本的新增、改进、修复和已知问题。',
          '顶栏铃铛入口：未读时显示小圆点，点击随时打开公告。',
          '帮助菜单与设置页增加“更新公告”入口。'
        ]
      },
      {
        type: 'improved',
        items: [
          '版本发布校验新增更新日志检查：版本号、CHANGELOG 与内置公告必须一致。',
          '更新下载完成后仍保留“重启并安装 / 稍后”的现有流程。'
        ]
      },
      {
        type: 'fixed',
        items: ['修复更新器从 0.1.1 起未静默安装的问题（`quitAndInstall(true, true)`）。']
      },
      {
        type: 'known',
        items: ['安装包尚未配置代码签名，SmartScreen 可能提示“未知发布者”。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.2`
  },
  {
    version: '0.1.1',
    date: '2026-10-26',
    title: '专用表单与文本导入',
    highlights: [
      '新增 summon / setblock 专用表单，give 支持粘贴命令导入。',
      '物品组件从 6 类扩展到 13 类，并支持任意 raw 组件。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'summon 专用表单：实体搜索、坐标开关、实体 NBT。',
          'setblock 专用表单：方块搜索、方块状态、方块实体 NBT、4 种放置模式。',
          'give 文本导入：粘贴 `/give` 命令还原为可编辑表单。',
          '新增 item_name、max_damage、damage、rarity、enchantment_glint_override、custom_data 与 raw 组件。'
        ]
      },
      {
        type: 'improved',
        items: [
          '项目文件保存 summon/setblock 状态，旧项目自动补默认值。',
          '单元测试 50 → 65，冒烟测试覆盖导入、summon、setblock。'
        ]
      },
      {
        type: 'fixed',
        items: ['更新器改为静默安装，避免重启更新时弹出 NSIS 向导。']
      },
      {
        type: 'known',
        items: ['复杂物品组件仍以原始 SNBT 兜底；未配置代码签名。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.1`
  },
  {
    version: '0.1.0',
    date: '2026-10-26',
    title: '首个可运行版本',
    highlights: [
      '26.3 数据包、give 表单、通用命令构建器、命令方块生成。',
      '本地项目、自动保存、安装包与自动更新。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          '26.3 数据包：94 个根命令、1,197 个字面量、59 种参数类型。',
          'give 专用表单与 6 类物品组件。',
          '通用命令构建器：所有根命令按官方命令树生成。',
          '命令方块模式：生成 `/setblock` 并处理 NBT 转义。',
          '项目保存/打开、自动保存、崩溃恢复。',
          'NSIS 安装包、便携版、GitHub Actions 发布与自动更新。'
        ]
      },
      {
        type: 'known',
        items: ['仅支持 26.3；未配置代码签名；复杂组件使用原始 SNBT。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.0`
  }
]

export function getChangelogEntry(version: string): ChangelogEntry | undefined {
  return CHANGELOG.find((entry) => entry.version === version)
}

export function latestChangelog(): ChangelogEntry {
  return CHANGELOG[0]
}

export const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
  added: '新增',
  improved: '改进',
  fixed: '修复',
  known: '已知问题'
}
