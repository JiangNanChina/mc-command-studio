import { useId } from 'react'
import type { Position } from '@mcstudio/core'

interface PositionInputProps {
  value: Position
  onChange: (position: Position) => void
  label?: string
}

export function PositionInput({ value, onChange, label }: PositionInputProps) {
  const id = useId()
  return (
    <div>
      {label ? <div className="field-label">{label}</div> : null}
      <div className="grid-3">
        {(['x', 'y', 'z'] as const).map((axis) => (
          <div className="field" key={axis}>
            <label className="field-label" htmlFor={`${id}-${axis}`}>
              {axis.toUpperCase()}
            </label>
            <input
              id={`${id}-${axis}`}
              className="input"
              value={value[axis]}
              spellCheck={false}
              placeholder="~"
              onChange={(event) => onChange({ ...value, [axis]: event.target.value })}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
