import type { CSSProperties } from 'react'
import {
  MC_ATLAS_COLUMNS,
  MC_ATLAS_ROWS,
  MC_ATLAS_URL,
  mcIconIndex,
  mcIconPosition,
  mcName,
  type McCategory
} from '../lib/mcAssets'

interface McIconProps {
  category: McCategory
  id: string
  size?: number
  className?: string
}

export function McIcon({ category, id, size = 24, className = '' }: McIconProps) {
  const index = mcIconIndex(category, id)
  if (index === undefined) {
    return (
      <span
        className={`mc-icon mc-icon-fallback ${className}`}
        style={{ width: size, height: size, fontSize: Math.max(10, size * 0.45) }}
        role="img"
        aria-label={mcName(category, id)}
      >
        {mcName(category, id).slice(0, 1)}
      </span>
    )
  }

  const { column, row } = mcIconPosition(index)
  const style: CSSProperties = {
    width: size,
    height: size,
    backgroundImage: `url(${MC_ATLAS_URL})`,
    backgroundSize: `${MC_ATLAS_COLUMNS * size}px ${MC_ATLAS_ROWS * size}px`,
    backgroundPosition: `-${column * size}px -${row * size}px`
  }

  return (
    <span
      className={`mc-icon ${className}`}
      style={style}
      role="img"
      aria-label={mcName(category, id)}
      title={mcName(category, id)}
    />
  )
}
