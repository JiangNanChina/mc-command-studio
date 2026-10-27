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
    version: '0.1.68',
    date: '2026-10-27',
    title: '1.8-1.11 旧版表单',
    highlights: ['testforblock/testforblocks/achievement。', '1.8 命令方块 NBT 校准。'],
    sections: [
      { type: 'added', items: ['旧版工具新增 3 个表单。'] },
      { type: 'improved', items: ['1.8 移除 conditionMet/UpdateLastExecution。', '单元测试 252 → 254。'] },
      { type: 'known', items: ['1.8–1.10 注册表尚未按官方语言文件校准。'] }
    ],
    releaseUrl: REPO + '/releases/tag/v0.1.68'
  },
  {
    version: '0.1.67',
    date: '2026-10-27',
    title: '1.8-1.11 Legacy 包',
    highlights: ['四个 Legacy 版本。', 'OOC 实体 ID 按版本切换。'],
    sections: [
      { type: 'added', items: ['1.8.9 / 1.9.4 / 1.10.2 / 1.11.2 数据包。', 'OOC FallingSand/MinecartCommandBlock 分支。'] },
      { type: 'improved', items: ['1.8 命令方块 NBT 兼容。', '单元测试 251 → 252。'] },
      { type: 'fixed', items: ['无。'] }
    ],
    releaseUrl: REPO + '/releases/tag/v0.1.67'
  },
  {
    version: '0.1.66',
    date: '2026-10-27',
    title: '1.12.2 give 与 OOC 命令行定位',
    highlights: ['give 专用表单。', '缩略图点击定位命令行。'],
    sections: [
      {
        type: 'added',
        items: [
          '1.12.2 give 表单。',
          'OOC 点选定位命令行。',
          '发射器/盔甲架/烟花模板。'
        ]
      },
      {
        type: 'improved',
        items: [
          '旧版工具页 5 个表单。',
          'entity_effect 参数测试。',
          '单元测试 250 → 251。'
        ]
      },
      {
        type: 'known',
        items: ['1.8–1.10 Legacy 数据包仍未接入。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.66`
  },
  {
    version: '0.1.65',
    date: '2026-10-27',
    title: '预设冲突确认与缩略图坐标联动',
    highlights: ['导入同名预设确认。', '缩略图点选显示坐标。'],
    sections: [
      {
        type: 'added',
        items: [
          '预设导入冲突确认。',
          '缩略图点选/悬停坐标。',
          'entity_effect 旧参数测试。'
        ]
      },
      {
        type: 'improved',
        items: [
          '冲突列表与无效 JSON 提示。',
          '点选高亮与坐标联动。',
          '单元测试 250。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.65`
  },
  {
    version: '0.1.64',
    date: '2026-10-27',
    title: '项目预设迁移与坐标范围',
    highlights: ['打开项目提示预设恢复。', 'OOC 显示坐标范围。'],
    sections: [
      {
        type: 'added',
        items: [
          '项目预设恢复数量提示。',
          'OOC 坐标范围提示。',
          '1.13.x 粒子模式前缀过滤。'
        ]
      },
      {
        type: 'improved',
        items: [
          '旧项目无预设时明确提示。',
          '坐标范围实时更新。',
          '粒子模式能力表覆盖 1.13.x。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.64`
  },
  {
    version: '0.1.63',
    date: '2026-10-27',
    title: '预设随项目保存与缩略图轴距',
    highlights: ['项目文件保存自定义预设。', '缩略图显示轴距。'],
    sections: [
      {
        type: 'added',
        items: [
          '项目 presets 字段与恢复。',
          'OOC 缩略图轴距标注。',
          '1.13.2 粒子参数提示。'
        ]
      },
      {
        type: 'improved',
        items: [
          '导入后预设栏即时刷新。',
          '单元测试 249 → 250。',
          '预设去重与 30 条上限。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.63`
  },
  {
    version: '0.1.62',
    date: '2026-10-27',
    title: '预设管理与布局缩略图',
    highlights: ['预设重命名/导入导出。', 'OOC 布局缩略图。'],
    sections: [
      {
        type: 'added',
        items: [
          '自定义预设管理面板。',
          '预设 JSON 导入/导出。',
          'OOC 布局缩略图。'
        ]
      },
      {
        type: 'improved',
        items: [
          '导入去重并限制 30 条。',
          'effect/instant_effect 参数测试。',
          '布局预览同步刷新。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.62`
  },
  {
    version: '0.1.61',
    date: '2026-10-27',
    title: '自定义预设与粒子模式能力表',
    highlights: ['NBT/布局自定义预设。', '粒子模式按版本过滤。'],
    sections: [
      {
        type: 'added',
        items: [
          '1.12.2 自定义方块/实体/物品 NBT 预设。',
          'OOC 自定义布局预设。',
          'particleModeSupported 能力表。'
        ]
      },
      {
        type: 'improved',
        items: [
          '预设保存到 localStorage。',
          '1.13.2 隐藏 dust_transition。',
          '单元测试 248 → 249。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.61`
  },
  {
    version: '0.1.60',
    date: '2026-10-27',
    title: '1.12.2 模板与 OOC 布局预设',
    highlights: ['刷怪笼权重/八页书。', 'OOC 布局预设与预览。'],
    sections: [
      {
        type: 'added',
        items: [
          '1.12.2 刷怪笼权重/命令方块链参数。',
          '1.12.2 八页书预设。',
          'OOC 5 个布局预设与预览。'
        ]
      },
      {
        type: 'improved',
        items: [
          '1.13.2 隐藏 dust_transition。',
          '冒烟覆盖布局预设与八页书。',
          '单元测试 248。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.60`
  },
  {
    version: '0.1.59',
    date: '2026-10-27',
    title: '1.12.2 模板扩展与 OOC 独立轴间距',
    highlights: ['刷怪笼列表/长书/循环命令方块。', 'OOC 第二轴独立间距。'],
    sections: [
      {
        type: 'added',
        items: [
          '1.12.2 刷怪笼实体列表/循环命令方块预设。',
          '1.12.2 长书物品 NBT 预设。',
          'OOC 第二轴间距。',
          '1.13.2 粒子参数类型门禁。'
        ]
      },
      {
        type: 'improved',
        items: [
          '主副轴间距分别配置。',
          '单元测试 247 → 248。',
          '冒烟覆盖新预设。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.59`
  },
  {
    version: '0.1.58',
    date: '2026-10-27',
    title: '1.12.2 NBT 模板与 OOC 双轴网格',
    highlights: ['刷怪笼/命令方块链/成书。', 'OOC 双轴网格与条件回退。'],
    sections: [
      {
        type: 'added',
        items: [
          '1.12.2 刷怪笼/命令方块链预设。',
          '成书/附魔剑/药水/头颅物品 NBT 预设。',
          'OOC 第二轴与每行层数。'
        ]
      },
      {
        type: 'improved',
        items: [
          '条件链不支持时自动回退并提示。',
          '1.13.2 注册表门禁扩展。',
          '单元测试 246 → 247。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.58`
  },
  {
    version: '0.1.57',
    date: '2026-10-27',
    title: '1.12.2 NBT 模板与 OOC 条件链',
    highlights: ['旗帜/药水/村民交易模板。', 'OOC X/Z 轴与条件链。'],
    sections: [
      {
        type: 'added',
        items: [
          '1.12.2 旗帜/药水/村民交易/持久化预设。',
          'OOC 排布轴（X/Y/Z）。',
          'OOC 条件链（首块无条件，后续 +8）。'
        ]
      },
      {
        type: 'improved',
        items: [
          '1.13.2 注册表门禁。',
          '单元测试 245 → 246。',
          '冒烟覆盖新增预设与条件链。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.57`
  },
  {
    version: '0.1.56',
    date: '2026-10-27',
    title: '1.12.2 NBT 预设与 OOC 多层布局',
    highlights: ['方块/实体 NBT 预设。', 'OOC 自动沿 Y 轴排布多命令。'],
    sections: [
      {
        type: 'added',
        items: [
          '1.12.2 方块 NBT 预设（6 个）。',
          '1.12.2 实体 NBT 预设（8 个）。',
          'OOC 层间距输入与多层布局。'
        ]
      },
      {
        type: 'improved',
        items: [
          '命令方块模式多命令自动沿 Y 轴排布。',
          '掉落沙模式按层间距递增 Time。',
          '单元测试 244 → 245。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.56`
  },
  {
    version: '0.1.55',
    date: '2026-10-27',
    title: '1.12.2 旧版工具与 OOC 增强',
    highlights: ['testfor/blockdata/entitydata/replaceitem。', 'OOC 方向/条件/坐标快捷填充。'],
    sections: [
      {
        type: 'added',
        items: [
          '1.12.2 旧版工具页（4 个命令）。',
          'OOC 方向与条件模式。',
          '坐标快捷填充按钮。'
        ]
      },
      {
        type: 'improved',
        items: [
          '1.13.2 粒子 48 种确认。',
          '单元测试 240 → 244。',
          '冒烟覆盖旧版工具与 OOC 方向。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.55`
  },
  {
    version: '0.1.54',
    date: '2026-10-27',
    title: '1.12.2 Legacy 与 OOC',
    highlights: ['1.12.2 版本 + OOC 生成器。', '1.13.2 粒子表校准。'],
    sections: [
      {
        type: 'added',
        items: [
          '1.12.2 Legacy 数据包（53 根命令）。',
          '掉落沙 OOC、命令方块矿车、命令方块 NBT。'
        ]
      },
      {
        type: 'improved',
        items: [
          '1.13.2 粒子表校准为 1.13 的 48 种。',
          '旧版引擎走原始构建器 + OOC。',
          '单元测试 237 → 240。'
        ]
      },
      {
        type: 'fixed',
        items: ['1.13.2 不再显示 1.14 粒子。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.54`
  },
  {
    version: '0.1.53',
    date: '2026-10-27',
    title: '补齐 1.13.2 数据包',
    highlights: ['10 个数据包覆盖 1.13.2–1.20.4。', '1.13.2 官方 reports 转换器。'],
    sections: [
      {
        type: 'added',
        items: [
          '1.13.2 数据包：67 根命令、790 物品、598 方块。',
          'tools/pipeline/build-1.13.2.mjs 转换器。',
          '冒烟覆盖 1.13.2 版本切换。'
        ]
      },
      {
        type: 'improved',
        items: ['data:verify 覆盖 10 个数据包。', '旧版目录自动切换。']
      },
      {
        type: 'fixed',
        items: ['1.13.2 不再依赖 mcmeta 缺失的历史数据。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.53`
  },
  {
    version: '0.1.51',
    date: '2026-10-27',
    title: '旧版数据管线扩展到 1.14.4–1.20.3',
    highlights: ['9 个数据包版本。', '旧版目录/出生点/计分板差异适配。'],
    sections: [
      {
        type: 'added',
        items: [
          '1.20.3/1.19.4/1.18.2/1.16.5/1.15.2/1.14.4 数据包。',
          '版本化升级测试与冒烟。'
        ]
      },
      {
        type: 'improved',
        items: [
          '旧版数据包目录自动切换。',
          'scoreboard 字段按命令树过滤。',
          '1.21.1 粒子注册表 109 种验证。',
          '单元测试 236 → 237。'
        ]
      },
      {
        type: 'fixed',
        items: ['1.16.5/1.18.2 不再显示不存在的出生点朝向。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.51`
  },
  {
    version: '0.1.50',
    date: '2026-10-27',
    title: '1.21.1 与 1.20.4 语法适配',
    highlights: ['1.20.4 particle 旧参数、attribute UUID。', '1.21.1 gamerule/严格模式适配。'],
    sections: [
      {
        type: 'added',
        items: [
          '1.20.4 particle 参数语法。',
          '1.20.4 attribute UUID/name 修饰符。'
        ]
      },
      {
        type: 'improved',
        items: [
          '1.21.1 gamerule 动态名称/类型。',
          '隐藏 1.21.1 的 base reset、fill/setblock strict。',
          '单元测试 234 → 236。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.50`
  },
  {
    version: '0.1.49',
    date: '2026-10-27',
    title: '谓词新增记分板数值条件',
    highlights: ['value_check 条件。', '记分板目标 + 数值区间。'],
    sections: [
      {
        type: 'added',
        items: ['谓词 value_check 结构化编辑。', 'JSON 双向解析/序列化。']
      },
      {
        type: 'improved',
        items: ['单元测试 232 → 234。', '冒烟覆盖 value_check。']
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.49`
  },
  {
    version: '0.1.48',
    date: '2026-10-27',
    title: 'normalize 按领域拆分',
    highlights: ['1208 行归一化拆为 6 个领域模块。', '保持项目归一化入口兼容。'],
    sections: [
      {
        type: 'improved',
        items: [
          'common/player/entity/world/datapack/project 分模块。',
          'normalize/index.ts 统一出口。',
          '单元测试 232 个，冒烟通过。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.48`
  },
  {
    version: '0.1.47',
    date: '2026-10-27',
    title: 'store 拆分',
    highlights: ['store.ts 3,213 → 约 1,585 行。', '模型/默认值/归一化/选择器分模块。'],
    sections: [
      {
        type: 'improved',
        items: [
          '新增 store/model.ts、defaults.ts、normalize.ts、selectors.ts。',
          '保持 ../store 导入兼容。',
          '单元测试 230 → 232。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.47`
  },
  {
    version: '0.1.46',
    date: '2026-10-27',
    title: '1.20.4 gamerule 兼容',
    highlights: ['gamerule 规则按版本过滤。', '1.20.4 兼容表单再扩展。'],
    sections: [
      {
        type: 'added',
        items: ['动态读取数据包 gamerule 命令树。']
      },
      {
        type: 'improved',
        items: ['版本切换自动校正规则。', '冒烟覆盖 1.20.4 gamerule。']
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.46`
  },
  {
    version: '0.1.45',
    date: '2026-10-27',
    title: '启动性能：数据包编辑器按需加载',
    highlights: ['数据包编辑器懒加载。', '主包体积下降约 68 kB。'],
    sections: [
      {
        type: 'added',
        items: ['加载占位 UI。']
      },
      {
        type: 'improved',
        items: ['DatapackWorkspace 独立 chunk。', '主包 2,555 → 2,487 kB。']
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.45`
  },
  {
    version: '0.1.44',
    date: '2026-10-27',
    title: '服务器管理命令可视化',
    highlights: ['me/kick/op/deop 表单。', '1.20.4 同步可用。'],
    sections: [
      {
        type: 'added',
        items: ['动作消息、踢出、授予/撤销管理员。']
      },
      {
        type: 'improved',
        items: ['可视化根命令 47 → 51。', '单元测试 229 → 230。']
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.44`
  },
  {
    version: '0.1.43',
    date: '2026-10-27',
    title: '跨版本模板：1.20.4 NBT 剑',
    highlights: ['模板可自动切换数据包版本。', '新增 1.20.4 NBT 物品模板。'],
    sections: [
      {
        type: 'added',
        items: ['模板目标版本与自动切换。', '1.20.4 NBT 剑模板。']
      },
      {
        type: 'improved',
        items: ['模板异步应用与错误提示。', '冒烟覆盖跨版本模板。']
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.43`
  },
  {
    version: '0.1.42',
    date: '2026-10-27',
    title: '服务器/社交命令可视化',
    highlights: ['say/msg/kill/list/seed 表单。', '1.20.4 同步可用。'],
    sections: [
      {
        type: 'added',
        items: ['广播、私聊、清除实体、玩家列表、查看种子。']
      },
      {
        type: 'improved',
        items: ['可视化根命令 42 → 47。', '单元测试 224 → 229。']
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.42`
  },
  {
    version: '0.1.41',
    date: '2026-10-27',
    title: 'random / tick 可视化',
    highlights: ['随机数与游戏刻控制。', '1.20.4 同步可用。'],
    sections: [
      {
        type: 'added',
        items: ['random value/roll + 序列。', 'tick 冻结/加速/速率/单步。']
      },
      {
        type: 'improved',
        items: ['可视化根命令 40 → 42。', '单元测试 218 → 224。']
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.41`
  },
  {
    version: '0.1.40',
    date: '2026-10-27',
    title: 'spreadplayers / ride 可视化',
    highlights: ['新增分散玩家与骑乘表单。', '1.20.4 同步可用。'],
    sections: [
      {
        type: 'added',
        items: ['spreadplayers 中心/距离/范围/under/队伍。', 'ride 骑乘/下坐骑。']
      },
      {
        type: 'improved',
        items: ['可视化根命令 38 → 40。', '单元测试 213 → 218。']
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.40`
  },
  {
    version: '0.1.39',
    date: '2026-10-27',
    title: 'gamemode / damage / rotate 可视化',
    highlights: [
      '新增 3 个高频命令表单。',
      '1.20.4 同步可用。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'gamemode 四种模式与目标。',
          'damage 数值/类型/at/by 来源。',
          'rotate 旋转/朝向坐标/朝向实体。'
        ]
      },
      {
        type: 'improved',
        items: [
          '可视化根命令 35 → 38。',
          '单元测试 205 → 213；冒烟覆盖三个表单。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.39`
  },
  {
    version: '0.1.38',
    date: '2026-10-27',
    title: '1.20.4 loot 可视化',
    highlights: [
      '1.20.4 loot insert 语法适配。',
      '1.20.4 兼容表单增至 32 个。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          '1.20.4 loot give/spawn/insert。',
          'insert 自动省略槽位。'
        ]
      },
      {
        type: 'improved',
        items: [
          'loot 构建器引擎参数。',
          '单元测试 203 → 205；冒烟覆盖 loot insert。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.38`
  },
  {
    version: '0.1.37',
    date: '2026-10-27',
    title: '1.20.4 NBT 槽位物品与召唤预设',
    highlights: [
      'item 支持 1.20.4 NBT 后缀。',
      'summon 内置常用 NBT 预设。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          '1.20.4 item replace 追加 NBT。',
          'summon 无声/发光/生命/命名/清除预设。'
        ]
      },
      {
        type: 'improved',
        items: [
          'NBT 复合标签校验。',
          '单元测试 202 → 203；冒烟覆盖 item NBT 与 summon 预设。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.37`
  },
  {
    version: '0.1.36',
    date: '2026-10-27',
    title: '1.20.4 兼容表单扩展',
    highlights: [
      '1.20.4 启用 31 个兼容表单。',
      '版本敏感命令继续使用命令树。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'summon/tp/effect/fill/clone/setblock/execute 等 31 个表单。',
          'give 使用 NBT 表单。'
        ]
      },
      {
        type: 'improved',
        items: [
          'packCompat 白名单与单元测试。',
          '单元测试 200 → 202；冒烟覆盖 1.20.4 summon。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.36`
  },
  {
    version: '0.1.35',
    date: '2026-10-27',
    title: '1.20.4 NBT 物品编辑器',
    highlights: [
      '1.20.4 give 使用 NBT 表单。',
      '名称、Lore、附魔、无法破坏。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'NBT give：目标/物品/数量/名称/Lore/附魔/Unbreakable。',
          '1.20.4 自动启用 NBT give 表单。'
        ]
      },
      {
        type: 'improved',
        items: [
          'NBT 物品构建器独立。',
          '单元测试 197 → 200；冒烟测试覆盖 NBT。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.35`
  },
  {
    version: '0.1.34',
    date: '2026-10-27',
    title: '一键模板库',
    highlights: [
      '7 个常用命令模板。',
      '套用后直接进入表单继续修改。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          '新手礼包、全服回血、欢迎语。',
          '活动 BOSS 栏、击杀计分板、红队、定时公告。',
          '顶栏模板入口。'
        ]
      },
      {
        type: 'improved',
        items: [
          '模板弹窗提升到页面级，避免裁切。',
          '冒烟测试覆盖模板套用。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.34`
  },
  {
    version: '0.1.33',
    date: '2026-10-27',
    title: '1.20.4 树模式与版本化数据包目录',
    highlights: [
      '1.20.4 命令树模式。',
      '数据包目录随版本切换。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          '1.20.4 数据包：82 根命令，NBT 引擎。',
          '1.20.4 仅命令树/通用构建器，可视化表单禁用。',
          '版本化数据包目录（复数/单数文件夹）。'
        ]
      },
      {
        type: 'improved',
        items: [
          '数据包引擎元数据。',
          'Release 打包冒烟门禁。',
          '单元测试 196 → 197。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.33`
  },
  {
    version: '0.1.32',
    date: '2026-10-27',
    title: '多版本数据包：1.21.1 试验支持',
    highlights: [
      '顶栏切换 26.3 / 1.21.1。',
      '1.21.1 命令树与通用构建器可用。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          '1.21.1 数据包：83 根命令、1,333 物品、1,060 方块。',
          '版本切换器与跨版本提示。',
          '构建流程同时生成 26.3 与 1.21.1。'
        ]
      },
      {
        type: 'improved',
        items: [
          'data:build/data:verify 覆盖双版本。',
          '冒烟测试覆盖版本切换。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.32`
  },
  {
    version: '0.1.31',
    date: '2026-10-27',
    title: 'BOSS 栏查询与计分目标修改',
    highlights: [
      'bossbar get/list。',
      'scoreboard objectives modify 全字段。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'bossbar get max/value/visible/players 与 list。',
          '计分目标显示名、自动更新、数字格式、渲染类型。'
        ]
      },
      {
        type: 'improved',
        items: [
          '数字格式 blank/fixed/styled 可视化。',
          '单元测试 194 → 196；冒烟测试覆盖新功能。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.31`
  },
  {
    version: '0.1.30',
    date: '2026-10-27',
    title: '谓词结构化编辑器',
    highlights: [
      '谓词条件可视化：概率、天气、时间、实体状态。',
      'all_of / any_of 组合。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          '随机概率、天气检查、时间检查、实体状态条件。',
          'all_of/any_of 多条件组合与增删。',
          '实体角色与 5 种状态 flags。'
        ]
      },
      {
        type: 'improved',
        items: [
          '不支持的条件回退 JSON。',
          '单元测试 190 → 194；冒烟测试覆盖概率写回。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.30`
  },
  {
    version: '0.1.29',
    date: '2026-10-27',
    title: '进度文件结构化编辑器',
    highlights: [
      '进度显示、图标、框架与触发器可视化。',
      '复杂结构自动回退 JSON。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          '进度父级、图标、标题、描述、框架与显示开关。',
          '触发条件名称、18 个常用触发器建议、增删。',
          '简单结构自动写回 JSON。'
        ]
      },
      {
        type: 'improved',
        items: [
          '复杂显示组件/条件/requirements 回退 JSON。',
          '单元测试 186 → 190。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.29`
  },
  {
    version: '0.1.28',
    date: '2026-10-27',
    title: '战利品表结构化编辑器',
    highlights: [
      '战利品表可视化编辑抽取次数、权重与数量。',
      '复杂结构自动回退 JSON。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          '战利品表类型、rolls、bonus rolls。',
          '掉落物物品选择器、权重、数量区间、增删。',
          '简单结构自动写回 JSON。'
        ]
      },
      {
        type: 'improved',
        items: [
          '多池/条件/非物品结构回退 JSON，避免丢字段。',
          '单元测试 182 → 186；冒烟测试覆盖物品选择。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.28`
  },
  {
    version: '0.1.27',
    date: '2026-10-27',
    title: 'data from 与队伍高级显示名',
    highlights: [
      'data modify 支持从实体/方块/存储复制。',
      'team 高级显示名文本组件。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'data modify from：实体/方块实体/命令存储，来源路径可选。',
          'set/merge/append/prepend/insert 支持 from。',
          'team 高级显示名文本片段编辑与预览。'
        ]
      },
      {
        type: 'improved',
        items: [
          '来源存储/路径校验。',
          '单元测试 180 → 182；冒烟测试覆盖新功能。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.27`
  },
  {
    version: '0.1.26',
    date: '2026-10-26',
    title: 'data modify 与队伍前缀后缀',
    highlights: [
      'data modify 六种操作。',
      'team 前缀/后缀文本组件编辑。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'data modify：set/merge/append/prepend/insert/remove。',
          '列表索引与 SNBT 值编辑。',
          'team prefix/suffix 文本片段编辑与预览。'
        ]
      },
      {
        type: 'improved',
        items: [
          '前缀/后缀换行校验。',
          '单元测试 178 → 180；冒烟测试覆盖新功能。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.26`
  },
  {
    version: '0.1.25',
    date: '2026-10-26',
    title: '可视化 NBT 与战利品表',
    highlights: [
      'data 查询/合并/删除 NBT。',
      'loot 给予/生成/插入，战利品表自动建议。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'data：实体/方块实体/命令存储，get/merge/remove。',
          'loot：give/spawn/insert，槽位与战利品表建议。',
          '数据包 loot_table 文件自动出现在建议中。'
        ]
      },
      {
        type: 'improved',
        items: [
          'NBT/路径/战利品表/槽位校验。',
          '单元测试 171 → 178；冒烟测试覆盖主要操作。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.25`
  },
  {
    version: '0.1.24',
    date: '2026-10-26',
    title: '物品、高级数据文件与单元体系',
    highlights: [
      'item 槽位替换与物品修饰符。',
      '数据包支持谓词、进度、战利品表 JSON。',
      '资源 ID/数值/物品栈/槽位统一校验。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'item：实体/方块容器槽位替换、数量 1–99、修饰符。',
          '数据包高级文件：谓词、进度、战利品表，模板与 JSON 校验。',
          '单元体系 units.ts：资源 ID、数值、物品栈、槽位。'
        ]
      },
      {
        type: 'improved',
        items: [
          '重复文件路径与非法 JSON 明确报错。',
          '相关命令模块改用统一单元校验。',
          '单元测试 162 → 171。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.24`
  },
  {
    version: '0.1.23',
    date: '2026-10-26',
    title: '可视化进度、函数与计划任务',
    highlights: [
      'advancement 授予/收回与五种范围。',
      'function 宏参数、schedule 延迟/清除。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'advancement：grant/revoke、only/from/through/until/everything、criterion。',
          'function：函数名与可选 SNBT 宏参数。',
          'schedule：延迟运行、append/replace、clear。',
          '函数名可从数据包工作区自动补全。'
        ]
      },
      {
        type: 'improved',
        items: [
          '资源名与时间格式校验。',
          '单元测试 153 → 162；冒烟测试覆盖三项。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.23`
  },
  {
    version: '0.1.22',
    date: '2026-10-26',
    title: '可视化实体属性 attribute',
    highlights: [
      '总属性/基础值查询与设置、基础值重置。',
      '修饰符增删与查询，40 个属性中文名选择器。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'attribute：get / base get / base set / base reset。',
          'modifier add / remove / value get。',
          '40 个属性中文名选择器、scale 缩放查询。'
        ]
      },
      {
        type: 'improved',
        items: [
          '属性/修饰符资源名校验。',
          '单元测试 149 → 153；冒烟测试覆盖主要操作。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.22`
  },
  {
    version: '0.1.21',
    date: '2026-10-26',
    title: '全新图标与更简洁的更新公告',
    highlights: [
      '命令方块品牌图成为应用图标与界面 Logo。',
      '更新公告只展示当前版本，历史版本跳转 GitHub。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          '全新应用图标、安装包图标、顶栏/欢迎页/关于页 Logo。',
          '更新公告“查看历史版本”入口。'
        ]
      },
      {
        type: 'improved',
        items: [
          '公告只展示当前版本更新内容，不再显示所有版本列表。',
          '公告只保留“新增 / 改进 / 修复”三个栏目。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.21`
  },
  {
    version: '0.1.20',
    date: '2026-10-26',
    title: '出生点与区块加载',
    highlights: [
      'spawnpoint / setworldspawn / forceload 共用页面。',
      '出生朝向、矩形区块加载区域。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'spawnpoint：玩家目标、坐标、可选 yaw/pitch。',
          'setworldspawn：世界出生坐标、可选朝向。',
          'forceload：add/remove/remove all/query，支持矩形区域。'
        ]
      },
      {
        type: 'improved',
        items: [
          '整数区块坐标与朝向校验。',
          '单元测试 145 → 149；冒烟测试覆盖三项。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      },
      {
        type: 'known',
        items: ['item/attribute 等命令仍在高级命令树。', '安装包尚未配置代码签名。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.20`
  },
  {
    version: '0.1.19',
    date: '2026-10-26',
    title: '可视化队伍 team',
    highlights: [
      '队伍创建/修改/加入/离开/删除/查询。',
      '16 色、友伤、隐身队友、名字标签、碰撞规则。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'team 六种操作：create/modify/join/leave/remove/list。',
          '16 种颜色、显示名称、friendlyFire、seeFriendlyInvisibles。',
          'nametagVisibility 与 collisionRule。'
        ]
      },
      {
        type: 'improved',
        items: [
          '多行 team 输出禁用单命令方块。',
          '队伍名校验。',
          '单元测试 141 → 145；冒烟测试覆盖创建/加入/离开。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      },
      {
        type: 'known',
        items: ['team prefix/suffix 等组件选项仍在高级命令树。', '安装包尚未配置代码签名。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.19`
  },
  {
    version: '0.1.18',
    date: '2026-10-26',
    title: '可视化世界边界 worldborder',
    highlights: [
      '尺寸/中心/伤害/警告/查询全部可视化。',
      '过渡时间与边界预览，范围提示。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'worldborder：set/add/center/damage amount/damage buffer/warning distance/warning time/get。',
          '尺寸过渡时间、中心坐标、边界示意预览。'
        ]
      },
      {
        type: 'improved',
        items: [
          '按操作切换字段与默认值。',
          '数值/时间校验。',
          '单元测试 137 → 141；冒烟测试覆盖四种操作。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      },
      {
        type: 'known',
        items: ['team/item/attribute 等命令仍在高级命令树。', '安装包尚未配置代码签名。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.18`
  },
  {
    version: '0.1.17',
    date: '2026-10-26',
    title: '可视化游戏规则 gamerule',
    highlights: [
      '59 条 26.3 游戏规则，中文名/ID/说明搜索。',
      '布尔开关、整数范围、查询当前值。'
    ],
    sections: [
      {
        type: 'added',
        items: [
          'gamerule 规则选择器（59 条，类型徽标）。',
          '布尔规则开关、整数规则输入、查询模式。',
          '规则中文名/说明来自官方语言文件。'
        ]
      },
      {
        type: 'improved',
        items: [
          '规则名与值类型校验。',
          '单元测试 134 → 137；冒烟测试覆盖布尔/整数。'
        ]
      },
      {
        type: 'fixed',
        items: ['无。']
      },
      {
        type: 'known',
        items: ['部分新规则缺少官方中文名，显示英文 ID 名称。', '安装包尚未配置代码签名。']
      }
    ],
    releaseUrl: `${REPO}/releases/tag/v0.1.17`
  },
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
