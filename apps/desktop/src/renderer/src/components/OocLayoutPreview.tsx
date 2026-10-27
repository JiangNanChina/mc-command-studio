interface Props {
  count: number
  rowSize: number
  secondary: boolean
  primaryAxis: string
  secondaryAxis: string
  primaryStep: number
  secondaryStep: number
}

export function OocLayoutPreview({
  count,
  rowSize,
  secondary,
  primaryAxis,
  secondaryAxis,
  primaryStep,
  secondaryStep
}: Props) {
  if (count <= 0) {
    return <div className="hint">填写命令后显示布局预览。</div>
  }
  const columns = secondary ? Math.max(1, Math.min(rowSize, count)) : 1
  const rows = Math.ceil(count / columns)
  const width = 260
  const height = Math.max(86, Math.min(200, rows * 18 + 40))
  const stepX = columns > 1 ? (width - 40) / (columns - 1) : 0
  const stepY = rows > 1 ? (height - 55) / (rows - 1) : 0
  const gapRatio = secondaryStep > 0 && primaryStep > 0 ? secondaryStep / primaryStep : 1

  return (
    <svg
      id="ooc-layout-preview-graphic"
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${rows} 行 ${columns} 列布局预览`}
      style={{
        marginTop: 8,
        background: 'var(--bg-soft, rgba(127,127,127,0.08))',
        borderRadius: 8
      }}
    >
      <text x={10} y={16} fill="currentColor" fontSize={10} opacity={0.65}>
        {primaryAxis.toUpperCase()} 间距 {primaryStep}
      </text>
      <text
        x={width - 10}
        y={height - 8}
        fill="currentColor"
        fontSize={10}
        opacity={0.65}
        textAnchor="end"
      >
        {secondary
          ? `${secondaryAxis.toUpperCase()} 间距 ${secondaryStep}（横向比例 ${gapRatio.toFixed(1)}×）`
          : '单轴'}
      </text>
      {Array.from({ length: Math.min(count, 60) }, (_, index) => {
        const column = secondary ? index % columns : 0
        const row = secondary ? Math.floor(index / columns) : index
        const x = columns > 1 ? 20 + column * stepX : width / 2
        const y = rows > 1 ? 30 + row * stepY : (height - 16) / 2
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r={4}
            fill="var(--accent, #4f8cff)"
            opacity={0.85}
          />
        )
      })}
    </svg>
  )
}
