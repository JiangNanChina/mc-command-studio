import { itemFieldName, type ItemFieldKind } from '../lib/itemFieldLabels'

/** Keep the editable game ID visible while also showing its Chinese name. */
export function ItemIdName({ id, kind, value, prefix = '' }: {
  id: string
  kind: ItemFieldKind
  value: string
  prefix?: string
}) {
  return <div id={id} className="hint item-id-name" style={{ marginTop: 6, overflowWrap: 'anywhere' }}>
    {prefix}{itemFieldName(kind, value)}
  </div>
}
