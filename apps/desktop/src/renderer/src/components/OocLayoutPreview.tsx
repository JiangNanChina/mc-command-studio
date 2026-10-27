interface Props {
  count: number
  rowSize: number
  secondary: boolean
}

export function OocLayoutPreview({ count, rowSize, secondary }: Props) {
  if (count <= 0) {
    return <div className="hint">填写命令后显示布局预览。</div>
  }
  const columns = secondary ? Math.max(1, Math.min(rowSize, count)) : 1
  const rows = Math.ceil(count / columns)
  const width = 260
  const height = Math.max(70, Math.min(180, rows * 18 + 20))
  const stepX = columns > 1 ? (width - 40) / (columns - 1) : 0
  const stepY = rows > 1 ? (height - 30) / (rows - 1) : 0

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
      {Array.from({ length: Math.min(count, 60) }, (_, index) => {
        const column = secondary ? index % columns : 0
        const row = secondary ? Math.floor(index / columns) : index
        const x = columns > 1 ? 20 + column * stepX : width / 2
        const y = rows > 1 ? 15 + row * stepY : height / 2
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
