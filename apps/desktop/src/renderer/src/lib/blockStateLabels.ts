const STATE_NAMES: Record<string, string> = {
  age: '生长阶段', attached: '已连接', attachment: '附着方式', axis: '轴向', berries: '结有浆果',
  bites: '已食用次数', bloom: '绽放状态', bottom: '底部', can_summon: '可召唤', candles: '蜡烛数量',
  charges: '充能次数', conditional: '条件制约', copper_golem_pose: '铜傀儡姿态', cracked: '开裂',
  crafting: '正在合成', creaking_heart_state: '嘎枝之心状态', delay: '延迟', disarmed: '已解除',
  distance: '连接距离', down: '下方连接', drag: '向下气泡', dusted: '刷扫阶段', east: '东侧连接',
  eggs: '蛋的数量', enabled: '启用', extended: '已伸出', eye: '含末影之眼', face: '附着表面',
  facing: '朝向', flower_amount: '花朵数量', half: '上下部分', hanging: '悬挂', has_book: '含书本',
  has_bottle_0: '第 1 瓶位有药水', has_bottle_1: '第 2 瓶位有药水', has_bottle_2: '第 3 瓶位有药水',
  has_record: '含唱片', hatch: '孵化阶段', hinge: '门轴位置', honey_level: '蜂蜜等级', hydration: '含水量',
  in_wall: '嵌入墙中', instrument: '乐器', inverted: '反向输出', layers: '层数', leaves: '叶片大小',
  level: '等级', lit: '点亮', locked: '锁定', mode: '工作模式', moisture: '湿润度', natural: '自然生成',
  north: '北侧连接', note: '音高', occupied: '被占用', ominous: '不祥状态', open: '打开',
  orientation: '方向组合', part: '部位', persistent: '保持存在', pickles: '海泡菜数量', power: '信号强度',
  powered: '被充能', rotation: '旋转角度', sculk_sensor_phase: '幽匿感测体阶段', segment_amount: '节段数量',
  shape: '形状', short: '短型', shrieking: '尖啸中', side_chain: '侧向连接', signal_fire: '信号烟',
  snowy: '积雪', south: '南侧连接', stage: '阶段', thickness: '粗细', tilt: '倾斜程度', tip: '尖端',
  trial_spawner_state: '试炼刷怪笼阶段', triggered: '已触发', type: '类型', unstable: '不稳定',
  up: '上方连接', vault_state: '宝库阶段', vertical_direction: '竖直方向', waterlogged: '含水', west: '西侧连接'
}

const VALUE_NAMES: Record<string, string> = {
  true: '是', false: '否', north: '北', south: '南', east: '东', west: '西', up: '上', down: '下',
  top: '上半部分', bottom: '下半部分', upper: '上部', lower: '下部', left: '左', right: '右',
  x: '东西轴', y: '竖直轴', z: '南北轴', floor: '地面', wall: '墙面', ceiling: '天花板',
  single: '单个', double: '双层', straight: '直线', inner_left: '左内拐角', inner_right: '右内拐角',
  outer_left: '左外拐角', outer_right: '右外拐角', none: '无', normal: '普通', sticky: '黏性',
  head: '头部', foot: '尾部', small: '小型', large: '大型', tall: '高', low: '低',
  ascending_east: '向东爬升', ascending_west: '向西爬升', ascending_north: '向北爬升', ascending_south: '向南爬升',
  north_south: '南北连接', east_west: '东西连接', north_east: '东北连接', north_west: '西北连接',
  south_east: '东南连接', south_west: '西南连接', compare: '比较', subtract: '减法',
  save: '保存', load: '加载', data: '数据', corner: '角落', start: '开始', active: '活跃',
  inactive: '未激活', cooldown: '冷却', waiting_for_players: '等待玩家', waiting_for_reward_ejection: '等待弹出奖励',
  ejecting_reward: '弹出奖励', ejecting: '弹出中', unlocking: '解锁中', waiting: '等待中',
  uninitialized: '未初始化', dormant: '休眠', awake: '唤醒', standing: '站立', sitting: '坐下',
  running: '运行中', unpowered: '未充能', powered: '已充能', unstable: '不稳定', partial: '部分倾斜', full: '完全倾斜',
  tip: '尖端', tip_merge: '尖端连接', frustum: '锥台', middle: '中部', base: '底部',
  harp: '竖琴', basedrum: '底鼓', snare: '军鼓', hat: '踩镲', bass: '贝斯', flute: '长笛', bell: '钟琴',
  guitar: '吉他', chime: '风铃', xylophone: '木琴', iron_xylophone: '铁木琴', cow_bell: '牛铃',
  didgeridoo: '迪吉里杜管', bit: '方波音', banjo: '班卓琴', pling: '电钢琴',
  zombie: '僵尸', skeleton: '骷髅', creeper: '爬行者', dragon: '末影龙', wither_skeleton: '凋灵骷髅',
  piglin: '猪灵', custom_head: '自定义头颅', center: '中心', side: '侧边', continuous: '连续',
  single_wall: '单侧墙', double_wall: '双侧墙', dry: '干燥', accept: '接收', fail: '失败'
}

export function blockStateName(key: string): string {
  const slot = /^slot_(\d+)_occupied$/.exec(key)
  return STATE_NAMES[key] ?? (slot ? `第 ${Number(slot[1]) + 1} 格有物品` : '扩展状态')
}

export function blockStateValueName(value: string): string {
  if (/^-?\d+$/.test(value)) return value
  if (VALUE_NAMES[value]) return VALUE_NAMES[value]
  const directions = value.split('_')
  return directions.every((part) => ['up', 'down', 'north', 'south', 'east', 'west'].includes(part))
    ? directions.map((part) => VALUE_NAMES[part]).join(' / ') : '扩展状态值'
}
