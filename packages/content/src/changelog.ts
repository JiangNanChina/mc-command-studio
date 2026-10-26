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
    version: '0.1.16',
    date: '2026-10-26',
    title: '可视化标签与清除物品',
    highlights: [
      'tag 添加/移除/查询实体标签。',
      'clear 清除全部或指定物品，支持数量上限。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'tag：实体选择器、标签名、添加/移除/查询。',
          'clear：全部物品/指定物品、最大数量、0 仅统计。',
          '指定物品复用中文图标选择器。'
        ]
      },
      {
        type: 'improved',
        items: [
          '标签名空格校验与命名空间提示。',
          '单元测试 129 → 134；冒烟测试覆盖 tag 与 clear。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      },
      {
        type: 'known',
        items: ['team/gamerule 等命令仍在高级命令树。', '安装包尚未配置代码签名。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.16`
  },
  {
    version: '0.1.15',
    date: '2026-10-26',
    title: '世界控制 time/weather/difficulty',
    highlights: [
      '时间、天气、难度合并为一个可视化页面，标签切换。',
      '时间预设/自定义 tick、天气持续时间、难度机制说明。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'time：设置/推进/查询，6 种预设 + 自定义 tick。',
          'weather：晴天/下雨/雷暴 + 可选持续时间。',
          'difficulty：和平/简单/普通/困难。'
        ]
      },
      {
        type: 'improved',
        items: [
          '三个世界命令共用页面。',
          '整数校验与机制提示。',
          '单元测试 125 → 129；冒烟测试覆盖三项。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      },
      {
        type: 'known',
        items: ['gamerule/worldborder 等世界命令仍在高级命令树。', '安装包尚未配置代码签名。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.15`
  },
  {
    version: '0.1.14',
    date: '2026-10-26',
    title: '可视化粒子 particle',
    highlights: [
      '128 种粒子中文名选择，支持粉尘/方块/物品/颜色/原始 SNBT 参数。',
      '位置、扩散、速度、数量、force 与可见玩家全部可视化。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'particle 粒子选择器：128 种粒子、中文名、ID 搜索。',
          'SNBT 参数：block/dust/dust_color_transition/item/color/rgba/raw。',
          '位置、ΔXYZ、speed、count、force、viewers。'
        ]
      },
      {
        type: 'improved',
        items: [
          '按粒子类型自动推断参数并填充默认 SNBT。',
          '方块/物品参数复用中文图标选择器。',
          '单元测试 119 → 125；冒烟测试覆盖红石尘输出。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      },
      {
        type: 'known',
        items: ['trail/vibration 等极复杂参数使用原始 SNBT 编辑。', '安装包尚未配置代码签名。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.14`
  },
  {
    version: '0.1.13',
    date: '2026-10-26',
    title: '可视化计分板 scoreboard',
    highlights: [
      '计分目标、显示位置、玩家加减/设置/查询/运算全部可视化。',
      '目标名、计分项、分数与显示位置带校验和建议。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'scoreboard 目标：创建、删除、setdisplay。',
          '玩家分数：set/add/remove/reset/get/operation。',
          '计分项与显示位置建议，支持自定义。',
          '侧边栏分数预览。'
        ]
      },
      {
        type: 'improved',
        items: [
          '操作按目标/玩家分组。',
          '单元测试 114 → 119；冒烟测试覆盖创建目标、设置分数和运算。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      },
      {
        type: 'known',
        items: ['scoreboard objectives modify、players list 等高级操作仍可用高级命令树。', '安装包尚未配置代码签名。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.13`
  },
  {
    version: '0.1.12',
    date: '2026-10-26',
    title: '数据包工作区独立',
    highlights: [
      '数据包制作从命令编辑器拆出，侧栏“工具”单独打开。',
      '支持多函数、load/tick 标签、文件预览与独立导出。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          '数据包工作区：命名空间、描述、多函数管理、函数命令编辑。',
          'load/tick 标签选择；支持 lib/init 子目录函数名。',
          '导出前文件树预览与校验。'
        ]
      },
      {
        type: 'improved',
        items: [
          '命令编辑器输出面板移除数据包导出按钮。',
          '数据包草稿写入项目文件，撤销/重做覆盖。',
          '导出 API 支持多函数；重复函数名/缺失标签目标会报错。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      },
      {
        type: 'known',
        items: ['数据包暂不支持递归函数标签、谓词/进度/战利品表等高级内容。', '安装包尚未配置代码签名。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.12`
  },
  {
    version: '0.1.11',
    date: '2026-10-26',
    title: '可视化 BOSS 栏 bossbar',
    highlights: [
      'bossbar 创建/更新/移除全部可视化，颜色、样式、数值、玩家列表。',
      '实时 BOSS 栏预览，创建时自动生成完整命令序列。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'bossbar 三种操作：创建并配置、更新现有、移除。',
          '7 种颜色、5 种样式、最大值/当前值/可见性、玩家列表。',
          '可视化 BOSS 栏预览。'
        ]
      },
      {
        type: 'improved',
        items: [
          '多行 bossbar 输出自动禁用单命令方块模式。',
          '单元测试 111 → 114；冒烟测试覆盖创建与移除。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      },
      {
        type: 'known',
        items: ['复杂 BOSS 栏操作（get/list/players 清空）仍可用高级命令树。', '安装包尚未配置代码签名。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.11`
  },
  {
    version: '0.1.10',
    date: '2026-10-26',
    title: '可视化声音 playsound / stopsound',
    highlights: [
      '1,991 个声音支持中文名/ID 搜索与图标选择。',
      'playsound 可视化音量/音调/坐标；stopsound 支持全部/来源/指定声音。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'playsound：声音选择器、来源、目标、坐标、音量/音调/最小音量。',
          'stopsound：全部声音、指定来源、指定声音。',
          '声音中文字幕名 + 首字图标，支持中文搜索。'
        ]
      },
      {
        type: 'improved',
        items: [
          '进入 playsound/stopsound 自动切换播放/停止模式。',
          '单元测试 108 → 111；冒烟测试覆盖声音选择与 stopsound。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      },
      {
        type: 'known',
        items: ['部分声音没有官方字幕，显示英文 ID 名称。', '安装包尚未配置代码签名。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.10`
  },
  {
    version: '0.1.9',
    date: '2026-10-26',
    title: '可视化富文本 tellraw / title',
    highlights: [
      'tellraw/title 改为可视化文本编辑器，支持颜色、样式、点击/悬停。',
      'title 支持淡入/停留/淡出 tick 与实时预览。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'tellraw：多段文本、16 色、粗体/斜体/下划线/删除线/随机字符。',
          '点击事件（链接/命令/填入/复制）与悬停文本。',
          'title：主标题/副标题/动作栏，times 时序。',
          '实时富文本预览。'
        ]
      },
      {
        type: 'improved',
        items: [
          '多行 title 自动禁用单命令方块模式。',
          '单元测试 103 → 108；冒烟测试覆盖 tellraw 与 title times。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      },
      {
        type: 'known',
        items: ['复杂 JSON 文本（translate/score/nbt）仍可通过高级命令树输入。', '安装包尚未配置代码签名。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.9`
  },
  {
    version: '0.1.8',
    date: '2026-10-26',
    title: '可视化资源选择器',
    highlights: [
      '物品/方块/效果/附魔/实体改为中文名 + 图标网格选择。',
      '状态效果支持永久（infinite），不再只能填秒数。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          '26.3 官方中文名称：物品、方块、状态效果、附魔、实体。',
          '图标图集：真实材质优先，缺失项使用中文首字彩色图标。',
          '统一选择器：中文名/ID 搜索，give/setblock/summon/fill/clone/effect/enchant 接入。',
          '状态效果永久（infinite）开关。'
        ]
      },
      {
        type: 'improved',
        items: [
          '已选卡片显示中文名、ID 与图标。',
          '单元测试 102 → 103；冒烟测试覆盖中文搜索与永久效果。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      },
      {
        type: 'known',
        items: [
          '图标来自 26.3 客户端资源，仅用于识别；缺失材质使用占位图标。',
          '未覆盖的命令仍保留高级命令树。',
          '安装包尚未配置代码签名。'
        ]
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.8`
  },
  {
    version: '0.1.7',
    date: '2026-10-26',
    title: '附魔 / 经验与多行导出',
    highlights: [
      '新增 enchant、xp 专用表单。',
      '数据包导出支持多行命令，命令方块链可直接导出为函数。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'enchant：目标、附魔补全、快捷附魔、等级 1–255。',
          'xp：增加/设置/查询，经验点或等级。',
          '多行数据包导出：每行一条命令写入 .mcfunction。'
        ]
      },
      {
        type: 'improved',
        items: [
          '导出对话框标注“每行一条命令”，命令方块链导出不再被禁用。',
          '单元测试 95 → 102；冒烟测试覆盖 enchant、xp 与链导出。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      },
      {
        type: 'known',
        items: ['多行导出不会校验每行命令语法；安装包尚未配置代码签名。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.7`
  },
  {
    version: '0.1.6',
    date: '2026-10-26',
    title: '命令方块链工作区',
    highlights: [
      '新增命令方块链：按方向排布最多 64 个脉冲/连锁/循环方块。',
      '整链预览与一键复制，坐标自动按方向偏移。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          '命令方块链：起点、方向、每个方块的命令/类型/有条件/保持开启。',
          '自动生成整链 setblock 命令，支持绝对与 ~ 相对坐标。',
          '侧栏工具入口、整链预览、复制全部。'
        ]
      },
      {
        type: 'improved',
        items: [
          '命令方块链写入项目文件，撤销/重做覆盖链编辑。',
          '单元测试 90 → 95；冒烟测试覆盖 2 格命令方块链。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      },
      {
        type: 'known',
        items: ['暂不支持 ^ 局部坐标；单链最多 64 个方块。', '安装包尚未配置代码签名。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.6`
  },
  {
    version: '0.1.5',
    date: '2026-10-26',
    title: 'clone 表单与撤销重做',
    highlights: [
      '新增 clone 专用表单：源区域、目标位置、masked/filtered、force/move。',
      '全局撤销/重做：Ctrl+Z / Ctrl+Shift+Z，顶栏按钮，最多 100 步。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'clone：源区域起止坐标、目标起点、replace/masked/filtered、normal/force/move。',
          '撤销/重做覆盖所有表单、通用构建器、项目名称与命令方块设置。',
          '顶栏撤销/重做按钮与 Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y 快捷键。'
        ]
      },
      {
        type: 'improved',
        items: [
          '连续输入按 500ms 合并，避免每个字符一步。',
          '新建/打开项目自动清空历史，历史不写入项目文件。',
          '单元测试 86 → 90；冒烟测试覆盖 clone 与撤销/重做。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      },
      {
        type: 'known',
        items: ['撤销历史只存在于当前会话，关闭应用后清空。', '安装包尚未配置代码签名。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.5`
  },
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
