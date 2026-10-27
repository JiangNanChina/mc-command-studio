import { useState } from 'react'
import { offsetCoordinate } from '@mcstudio/core'

interface Props {
  count: number
  rowSize: number
  secondary: boolean
  primaryAxis: string
  secondaryAxis: string
  primaryStep: number
  secondaryStep: number
  baseX: string
  baseY: string
  baseZ: string
  onSelect: (index: number) => void
}

export function OocLayoutPreview({
  count,
  rowSize,
  secondary,
  primaryAxis,
  secondaryAxis,
  primaryStep,
  secondaryStep,
  baseX,
  baseY,
  baseZ,
  onSelect
}: Props) {
  const [active, setActive] = useState<number | null>(null)
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

  const coordinateFor = (index: number): string => {
    const primaryIndex = secondary ? Math.floor(index / columns) : index
    const secondaryIndex = secondary ? index % columns : 0
    const offsetFor = (axis: string): number =>
      (primaryAxis === axis ? primaryIndex * primaryStep : 0) +
      (secondaryAxis === axis ? secondaryIndex * secondaryStep : 0)
    return `${offsetCoordinate(baseX, offsetFor('x'))} ${offsetCoordinate(baseY, offsetFor('y'))} ${offsetCoordinate(baseZ, offsetFor('z'))}`
  }

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
      {active !== null ? (
        <text
          x={width - 10}
          y={16}
          fill="var(--accent, #4f8cff)"
          fontSize={10}
          textAnchor="end"
        >
          #{active + 1} {coordinateFor(active)}
        </text>
      ) : null}
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
            r={active === index ? 6 : 4}
            fill="var(--accent, #4f8cff)"
            opacity={active === index ? 1 : 0.85}
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setActive(index)}
            onMouseLeave={() => setActive(null)}
            onClick={() => {
              setActive(index)
              onSelect(index)
            }}
          >
            <title>{`#${index + 1} ${coordinateFor(index)}`}</title>
          </circle>
        )
      })}
    </svg>
  )
}
