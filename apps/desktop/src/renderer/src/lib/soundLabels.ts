type SoundSource = 'items' | 'blocks' | 'entities'
type ResolveSourceName = (category: SoundSource, id: string) => string | undefined

const SOURCE_ALIASES: Record<string, string> = {
  bamboo_wood: '竹木', chain: '锁链', copper: '铜', coral_block: '珊瑚块', crop: '作物',
  eyeblossom: '眼眸花', fence_gate: '栅栏门', froglight: '蛙明灯', fungus: '菌类', grass: '草方块',
  hanging_sign: '悬挂式告示牌', iron: '铁', metal: '金属', metal_pressure_plate: '金属压力板',
  moss: '苔藓', nether_ore: '下界矿石', nether_wood: '下界木材', nylium: '菌岩',
  resin: '树脂', roots: '根', shelf: '架子', stem: '菌柄', wart_block: '疣块',
  wet_grass: '湿草', wood: '木材', wooden_button: '木按钮', wooden_door: '木门',
  wooden_pressure_plate: '木压力板', wooden_trapdoor: '木活板门', wool: '羊毛',
  hostile: '敌对生物', armor: '盔甲', bottle: '玻璃瓶',
  // These source names already occur in the bundled Chinese sound subtitles.
  poplar_leaves: '树叶', small_sulfur_cube: '小型硫方怪', sulfur_cube: '硫方怪', spear: '矛'
}

const SOURCE_SUFFIXES: Record<string, string> = {
  button: '按钮', door: '门', fence_gate: '栅栏门', hanging_sign: '悬挂式告示牌',
  pressure_plate: '压力板', trapdoor: '活板门'
}

const AMBIENT_PLACES: Record<string, string> = {
  basalt_deltas: '玄武岩三角洲', crimson_forest: '绯红森林', nether_wastes: '下界荒地',
  soul_sand_valley: '灵魂沙峡谷', warped_forest: '诡异森林', underwater: '水下'
}

const MUSIC_CONTEXTS: Record<string, string> = {
  creative: '创造模式', credits: '终末之诗与制作人员', dragon: '末影龙战斗', end: '末地',
  game: '游戏', menu: '主菜单', under_water: '水下',
  ...AMBIENT_PLACES, badlands: '恶地', bamboo_jungle: '竹林', cherry_grove: '樱花树林',
  deep_dark: '深暗之域', desert: '沙漠', dripstone_caves: '溶洞', flower_forest: '繁花森林',
  forest: '森林', frozen_peaks: '冰封山峰', grove: '雪林', jagged_peaks: '尖峭山峰',
  jungle: '丛林', lush_caves: '繁茂洞穴', meadow: '草甸', old_growth_taiga: '原始针叶林',
  snowy_slopes: '积雪山坡', sparse_jungle: '稀疏丛林', stony_peaks: '裸岩山峰', swamp: '沼泽'
}

/** These are event descriptions, not replacements for the original sound resource IDs. */
const ACTION_NAMES: Record<string, string> = {
  break: '破坏', fall: '物体落下', hit: '敲击', place: '放置', step: '脚步声',
  click_off: '释放', click_on: '按下', close: '关闭', open: '打开', ambient: '环境音', loop: '循环音',
  'ambient.short': '短环境音', pick_berries: '采摘浆果', insert: '放入', 'insert.enchanted': '放入附魔物品',
  pickup: '取出', 'pickup.enchanted': '取出附魔物品', fill_success: '填充成功', launch: '发射',
  spawn: '生成', close_long: '缓慢关闭', open_long: '缓慢打开', pop: '弹出',
  banjo: '班卓琴', basedrum: '低音鼓', bass: '贝斯', bell: '钟琴', bit: '方波音',
  chime: '风铃', cow_bell: '牛铃', didgeridoo: '迪吉里杜管', flute: '长笛', guitar: '吉他',
  harp: '竖琴', hat: '踩镲', iron_xylophone: '铁木琴', pling: '电子钢琴', snare: '军鼓',
  trumpet: '小号', trumpet_exposed: '斑驳铜小号', trumpet_oxidized: '氧化铜小号',
  trumpet_weathered: '锈蚀铜小号', xylophone: '木琴', contract: '收回', extend: '伸出',
  geyser_continuous_eruption: '间歇泉持续喷发', geyser_continuous_eruption_active: '间歇泉持续喷发活动',
  geyser_eruption_active: '间歇泉喷发活动', purreow: '呼噜与叫声', stray_ambient: '游荡环境音',
  hurt: '受伤', shear: '剪毛', step_sand: '沙地脚步声', beg_for_food: '乞食', death: '死亡',
  eat: '进食', hiss: '嘶叫', purr: '呼噜声', explode: '爆炸', death_water: '水中死亡',
  hurt_water: '水中受伤', death_land: '陆上死亡', hurt_land: '陆上受伤', throw: '投掷',
  blast_far: '远处爆炸', large_blast: '大型爆炸', large_blast_far: '远处大型爆炸',
  shoot: '发射', twinkle_far: '远处闪烁', tongue: '伸舌', scream: '尖叫', warn: '警告',
  'screaming.death': '尖叫变种死亡', 'screaming.eat': '尖叫变种进食',
  'screaming.hurt': '尖叫变种受伤', 'screaming.long_jump': '尖叫变种跳跃',
  'screaming.milk': '尖叫变种被挤奶', 'screaming.prepare_ram': '尖叫变种准备冲撞',
  'screaming.ram_impact': '尖叫变种冲撞', land: '着地', step_wood: '木面脚步声',
  big_fall: '高处跌落', small_fall: '低处跌落', splash: '溅水', swim: '游泳',
  death_small: '小型变种死亡', hurt_small: '小型变种受伤', jump: '跳跃',
  squish_small: '小型变种挤压', 'inside.underwater': '水下内部声',
  'attack.nodamage': '未造成伤害的攻击', breath: '呼吸', hurt_freeze: '冻伤',
  hurt_sweet_berry_bush: '被甜浆果丛刺伤', 'splash.high_speed': '高速溅水',
  hurt_closed: '闭合时受伤', ambient_water: '水中环境音', gallop_water: '水中疾驰',
  step_water: '水中脚步声', jump_small: '小型变种跳跃', squish: '挤压', saddle: '装备鞍',
  step_lava: '熔岩脚步声', break_block: '破坏方块', growl: '低吼', pant: '喘息', whine: '呜咽',
  attack_iron_door: '攻击铁门', equip_generic: '装备', fill_dragonbreath: '装入龙息',
  empty_axolotl: '倒出美西螈', empty_fish: '倒出鱼', empty_lava: '倒出熔岩',
  empty_powder_snow: '倒出细雪', empty_tadpole: '倒出蝌蚪', empty_sulfur_cube: '倒出硫方怪', fill_lava: '装入熔岩',
  fill_powder_snow: '装入细雪', loading_end: '装填完成', loading_middle: '装填中',
  loading_start: '开始装填', quick_charge_1: '快速装填一级', quick_charge_2: '快速装填二级',
  quick_charge_3: '快速装填三级', smash_ground_heavy: '重击地面', lunge_1: '突进一级',
  lunge_2: '突进二级', lunge_3: '突进三级', riptide_1: '激流一级', riptide_2: '激流二级',
  riptide_3: '激流三级', click: '点击', select_pattern: '选择图案', select_recipe: '选择配方',
  challenge_complete: '完成挑战', in: '弹出', out: '收起'
}

const SOUND_OVERRIDES: Record<string, string> = {
  intentionally_empty: '静音', 'ui.button.click': '按钮：点击', 'ui.loom.select_pattern': '织布机：选择图案',
  'ui.stonecutter.select_recipe': '切石机：选择配方', 'ui.toast.challenge_complete': '进度提示：完成挑战',
  'ui.toast.in': '通知：弹出', 'ui.toast.out': '通知：收起', 'weather.rain.above': '雨：上方雨声'
}

function sourceName(kind: string, subject: string, resolveName: ResolveSourceName): string | undefined {
  const category = kind === 'block' ? 'blocks' : kind === 'entity' ? 'entities' : 'items'
  const direct = resolveName(category, subject) ?? resolveName('items', subject)
  if (direct) return direct
  if (SOURCE_ALIASES[subject]) return SOURCE_ALIASES[subject]
  // Sound categories sometimes refer to a family of blocks rather than a block ID.
  const woodMatch = /^(bamboo|cherry|nether)_wood_(.+)$/.exec(subject)
  if (woodMatch && SOURCE_SUFFIXES[woodMatch[2]]) {
    const material = { bamboo: '竹', cherry: '樱花木', nether: '下界木' }[woodMatch[1]]
    return `${material}${SOURCE_SUFFIXES[woodMatch[2]]}`
  }
  const copperMatch = /^(copper_(?:chest|golem))_(oxidized|weathered)$/.exec(subject)
  if (copperMatch) return resolveName(category, `${copperMatch[2]}_${copperMatch[1]}`)
    ?? resolveName(category, copperMatch[1])
  if (kind === 'entity' && subject.startsWith('baby_')) {
    const adult = resolveName('entities', subject.slice(5))
    if (adult) return `幼年${adult}`
  }
  if (kind === 'entity') {
    // Known sound variants share a vanilla entity, while their distinct ID remains visible.
    const variant = /^(cat|chicken|cow|pig|wolf)_.+$/.exec(subject)
    if (variant) return resolveName('entities', variant[1])
  }
  return undefined
}

/** Called only for resource IDs present in the bundled sound catalog. */
export function localizedSoundName(id: string, resolveName: ResolveSourceName): string | undefined {
  if (SOUND_OVERRIDES[id]) return SOUND_OVERRIDES[id]
  const [kind, subject, ...parts] = id.split('.')
  if (kind === 'music_disc') return '音乐唱片'
  if (kind === 'music') {
    const context = MUSIC_CONTEXTS[parts.at(-1) ?? subject]
    return context ? `${context}：背景音乐` : undefined
  }
  if (kind === 'ambient') {
    const place = AMBIENT_PLACES[subject]
    const action = {
      additions: '附加环境音', loop: '循环环境音', mood: '氛围音', enter: '进入水中', exit: '离开水中',
      'loop.additions': '循环附加音', 'loop.additions.rare': '稀有循环附加音',
      'loop.additions.ultra_rare': '罕见循环附加音'
    }[parts.join('.')]
    return place && action ? `${place}：${action}` : undefined
  }
  if (!['block', 'entity', 'item'].includes(kind)) return undefined
  const source = sourceName(kind, subject, resolveName)
  if (!source) return undefined
  const event = parts.join('.')
  let action = ACTION_NAMES[event]
  if (!action && event.startsWith('imitate.')) {
    const entity = resolveName('entities', event.slice('imitate.'.length))
    if (entity) action = `模仿${entity}`
  }
  if (!action && subject === 'sulfur_cube') {
    const [variant, operation] = parts
    const property = {
      bouncy: '弹性', explosive: '爆炸性', fast_flat: '快速平面', fast_sliding: '快速滑动',
      high_resistance: '高抗性', hot: '炽热', light: '轻质', regular: '普通',
      slow_bouncy: '慢速弹性', slow_flat: '慢速平面', slow_sliding: '慢速滑动', sticky: '黏性'
    }[variant]
    const movement = { hit: '撞击', push: '推动' }[operation]
    if (property && movement) action = `${property}变种${movement}`
  }
  const horn = /^sound\.([0-7])$/.exec(event)
  if (!action && subject === 'goat_horn' && horn) action = `吹奏（音色 ${Number(horn[1]) + 1}）`
  return action ? `${source}：${action}` : undefined
}
